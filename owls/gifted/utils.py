from django.http import HttpResponse
from models import *
import csv
from dateutil import parser
from datetime import *
from random import  randint

GOOGLE_CLIENT_ID = '905317763411-2rbmiovs8pcahhv5jn5i6tekj0hflivf.apps.googleusercontent.com'

COOKIE_EXPIRY_TIME = 3600
MIN_GIFT_RANK = -5
MIN_GIFTS_TH = 5
TRUSTED_USER_RANK = 4
MAX_REMOVED = 3
age_ranges = [(0,1), (0,2), (3,6), (7,10), (11,14), (15,19), (20,25), (26,30), (31,40),(41,60), (61,70), (71,90), (91,200)]
MIN_RELATION_STRENGTH = 2
MAX_GIFTS = 50
PREMIUM_USER_RANK = 10
NOT_CHOSEN = 6
BAN_TIME = timedelta(1)

NOT_LOGGED_IN = 'You are not logged in.'
COOKIE_EXPIRED = 'Your session has expired. Please reload page'
BANNED = 'You are temporarily banned. Check our FAQ for more information.'


def check_logged(request):
    ans = dict()
    req_user_id = request.COOKIES.get('user_id')
    req_expiry_time = request.COOKIES.get('expiry_time')

    if 'user_id' in request.COOKIES:

            if not User.objects.filter(user_id=req_user_id).exists():
                ans['status'] = NOT_LOGGED_IN
                res = HttpResponse(json.dumps(ans), content_type='application/json', status=400)
                invalidate_cookie(res)

            elif User.objects.get(user_id=req_user_id).is_banned:
                ans['status'] = BANNED
                res = HttpResponse(json.dumps(ans), content_type='application/json', status=400)
                invalidate_cookie(res)

            elif parser.parse(req_expiry_time) < datetime.utcnow():
                ans['status'] = COOKIE_EXPIRED
                res = HttpResponse(json.dumps(ans), content_type='application/json', status=400)
                invalidate_cookie(res)
            else:
                return None
    else:
        ans['status'] = NOT_LOGGED_IN
        res = HttpResponse(json.dumps(ans), content_type='application/json', status=400)
    return res


# truncate list of gifts by the strength of their relation to the input relation
def truncate_by_relation_strength(gifts,relation,user_id):
    relations = RelationshipMatrixCell.objects.filter(rel1=relation)
    relations_dict = {}
    for rel in relations:
        relations_dict[rel.rel2] = rel.strength
    filtered_gifts = set()
    for addition in xrange(5-MIN_RELATION_STRENGTH):
        for gift in gifts:
            if gift.relationship.description.lower() == relation.lower():
                strength = 0
            else:
                strength = relations_dict.get(gift.relationship)

            if strength <= MIN_RELATION_STRENGTH + addition and gift.uploading_user.user_id != user_id:
                if gift not in filtered_gifts:
                    filtered_gifts.add(gift)
        if len(filtered_gifts) >= MIN_GIFTS_TH:
            break

    return [gift for gift in filtered_gifts]


def clear_db(request):
    Relation.objects.all().delete()
    RelationshipMatrixCell.objects.all().delete()
    # User.objects.all().delete()
    # Gift.objects.all().delete()


def update_rmatrix(rel, other_rel, rel_strength, user):
    try:
        rel_matrix_cell = RelationshipMatrixCell.objects.get(rel1_id=rel.pk, rel2_id=other_rel.pk)
        # if user improved the relationship decrease the strength by 0.01 thus making it closer
        if (rel_matrix_cell.strength - rel_strength) > 0:
            rel_matrix_cell.strength -= 0.01
        else:  # else weaken the strength
            rel_matrix_cell.strength += 0.01

        # normalize values
        if rel_matrix_cell.strength < 1:
            rel_matrix_cell.strength = 1
        elif rel_matrix_cell.strength > 5:
            rel_matrix_cell.strength = 5

    except TypeError:
        return HttpResponse(json.dumps({'status': 'relations ratio does not exist in db'}), status=401,
                            content_type='application/json')
    user.user_rank += 1
    rel_matrix_cell.save()


def init_relationship_matrix():
    try:
        with open('../Relationship_matrix.csv','r+') as rel_matrix_file:
            reader = csv.reader(rel_matrix_file)
            names = next(reader) # get columns names
            for name in names[1:]:
                rel1 = Relation(description=name)
                rel1.save()
            for row in reader:
                i = 0
                rel = ""
                for col in names:
                    indx = names.index(col)
                    if i == 0:
                        rel = row[indx]
                    elif not row[indx] == '' and not int(row[indx]) == 0:
                        try:
                            first_rel = Relation.objects.get(description=rel)
                            second_rel = Relation.objects.get(description=col)
                        except Relation.DoesNotExist:
                            return HttpResponse(json.dumps({'status': 'relations not found: ' + rel + ',' + col}), status=400)

                        relationship_matrix_cell = RelationshipMatrixCell(rel1=first_rel,
                                                                          rel2=second_rel, strength=int(row[indx]))
                        relationship_matrix_cell.save()
                    i = i + 1

    except IOError:
        return HttpResponse(json.dumps({'status':'file not found'}), status=400)
    return HttpResponse(json.dumps({}), status=200)


def fill_db(request):
    try:
        init_relationship_matrix()
    except (IOError, ValueError, TypeError):
        return HttpResponse(json.dumps({'status':'error'}), status=400)
    return HttpResponse(json.dumps({'status':'OK'}), status=200)


def add_initial_gifts(request):
    try:
        with open('../gifts.csv', 'r+') as rel_matrix_file:
            reader = csv.reader(rel_matrix_file)
            next(reader)  # skip columns names
            users = User.objects.all()
            i=0
            for row in reader:
                indx = randint(0, len(users))
                user = users[indx].get()

                title=row[0]
                description = row[1]
                age = row[2]
                gender = row[3]
                price = row[4]
                gift_img = row[5]
                rank = row[6]
                relationship = Relation.objects.get(description=row[7])
                gift = Gift(title=title,relationship=relationship,gift_img=gift_img,
                            age=age,description=description,price=price,gender=gender,gift_rank=rank,
                            uploading_user=user)
                i += 1
                user.user_rank += 2
                user.save()
                gift.save()
    except IOError:
        return HttpResponse(json.dumps({'status': 'file not found'}), status=400)

    return HttpResponse(json.dumps({'status':'OK'}), status=200)


def invalidate_cookie(response):
    response.delete_cookie('user_id')
    response.delete_cookie('given_name')
    response.delete_cookie('picture')
    response.delete_cookie('expiry_time')
    response.delete_cookie('user_rank')
    response.delete_cookie('removed_gifts_count')


def refresh_cookie(response, user):
    response.set_cookie('expiry_time', datetime.utcnow() + timedelta(seconds=COOKIE_EXPIRY_TIME))
    response.set_cookie('user_rank', user.user_rank)
    response.set_cookie('removed_gifts_count', user.gifts_removed)