from django.test import TestCase

# Create your tests here.
from utils import *
from django.shortcuts import redirect


def init_users():

    user_reg = User(user_id='112573066830407886679', email='spook90il@gmail.com')
    user_giftcard = User(user_id='102295589270978166917', email='gifted.owl.diamond@gmail.com', user_rank=300)
    user_banned = User(user_id='117629821000189708397', email='gifted.owl.spammer@gmail.com', gifts_removed=3, user_rank=-9)
    user_giftcard.save()
    user_banned.save()
    user_reg.save()

    spam_gift = Gift(title='SpamGift', description='SpamGift', age=22, price=22,
                gender='M', gift_img='', relationship=Relation(description='friend'), gift_rank=-4)
    spam_gift.uploading_user_id = user_banned.user_id
    spam_gift.save()


def unban(request):
    banned_usr = User.objects.get(user_id='117629821000189708397')
    banned_usr.is_banned = False
    banned_usr.banned_start = None
    banned_usr.gifts_removed = 0
    banned_usr.save()
    return redirect('http://localhost:63343/')


def enhance_relation(request):
    rel1 = request.GET.get('rel1')
    rel2 = request.GET.get('rel2')
    strength = request.GET.get('strength')
    if not rel1 or not rel2 or not strength :
        return HttpResponse(json.dumps({'status':'Failed'}),status=400)
    try:
        relation1 = Relation.objects.get(description=rel1)
        relation2 = Relation.objects.get(description=rel2)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({'status':'Failed'}),status=400)
    try:
        relmat = RelationshipMatrixCell.objects.get(rel1=relation1,rel2=relation2)
    except ObjectDoesNotExist:
        relmat = RelationshipMatrixCell.objects.get(rel1=relation2,rel2=relation1)

    relmat.strength += int(strength)
    if relmat.strength >= 5:
        relmat.strength = 5

    if relmat.strength <= 1:
        relmat.strength = 1
    relmat.save()
    return HttpResponse(json.dumps({'status':'OK'}))


def enhance_relation_by_unit(request):
    req = HttpRequest()
    req.GET = {'rel1' : 'cousin', 'rel2' : 'acquaintant', 'strength':-1}
    enhance_relation(req)
    return redirect('http://localhost:63343/')


def decrease_relation_by_unit(request):
    req = HttpRequest()
    req.GET = {'rel1' : 'cousin', 'rel2' : 'friend', 'strength':2}
    enhance_relation(req)
    return redirect('http://localhost:63343/')


def setup(request):
    clear_db(request)
    init_relations(request)
    init_users()
    init_gifts(request)

    #register newbie user without gifts
    user_newbie = User(user_id='113339757380497466993', email='gifted.owl.reg@gmail.com', user_rank=4)
    user_newbie.save()

    return redirect('http://localhost:63343/')


def clear_db(request):
    Relation.objects.all().delete()
    RelationshipMatrixCell.objects.all().delete()
    User.objects.all().delete()
    Gift.objects.all().delete()
    return HttpResponse(json.dumps({'status': 'OK'}), status=200, content_type='application/json')