from django.shortcuts import render
from django.http import HttpResponse
import json
from models import *
from oauth2client import client
from datetime import *
from dateutil import parser
import requests
import csv

MIN_SEARCH_RANK = 10
MIN_GIFT_RANK= -5
TRUST_USER_RANK= 5
MAX_REMOVED=3
age_ranges = [(0,2), (3,6), (7,10), (11,14), (15,17), (18,21), (22,25), (26,30), (31,40)]
MIN_RELATION_STRENGTH = 2
MAX_GIFTS = 50
PREMIUM_USER_RANK = 5
GOOGLE_CLIENT_ID = '905317763411-2rbmiovs8pcahhv5jn5i6tekj0hflivf.apps.googleusercontent.com'
NOT_LOGGED_IN = 'User is not logged-in'


def index(request):
    context = {}
    return render(request, 'gifted/index.html', context)


def like(request):

    ans = {}
    if not is_logged(request):
        ans['status'] = NOT_LOGGED_IN
        return HttpResponse(json.dumps(ans), content_type='application/json', status=400)

    body = json.loads(request.body)
    user_id = body['user_id']
    like = body['like']
    gift_id = body['gift_id']

    try:
        gift = Gift.objects.get(gift_id)
        user = User.objects.get(user_id)
        uploader = User.objects.get(gift.uploading_user)

    except User.DoesNotExist:
        return HttpResponse(json.dumps({'status': 'Gift/User/Uploader not found'}), status=400)

    gift.gift_rank = gift.gift_rank + int(like)

    # User may like/dislike other gifts only if his rank is high enough.
    if user.user_rank < TRUST_USER_RANK:
        return HttpResponse(json.dumps({'status':'user rank too low, cannot like'}),content_type='application/json',status=400)

    # Under gift rank of -5, the gift will be removed from the DB.
    if gift.gift_rank < MIN_GIFT_RANK:
        gift.delete()
        uploader.gifts_removed = uploader.gifts_removed + 1
        if uploader.gifts_removed > MAX_REMOVED:
            uploader.is_banned = True
            uploader.banned_start = datetime.now()

    # if the picture is liked, the uploader gets 1 point
    if like > 0:
        uploader.user_rank = uploader.user_rank+1

    gift.save()
    user.save()
    uploader.save()
    ans['status'] = 'Like succesfully done.'
    return HttpResponse(json.dumps(ans), content_type='application/json')


def is_logged(request):
    if 'user_id' in request.COOKIES:
        req_user_id = request.COOKIES.get('user_id')
        req_expiry_time = request.COOKIES.get('expiry_time')
        if not User.objects.filter(user_id=req_user_id).exists():
            return False
        if  parser.parse(req_expiry_time) < datetime.utcnow():
            return False
        return True
    else:
        return False

def invalidate_cookie(response):
    response.delete_cookie('user_id')
    response.delete_cookie('given_name')
    response.delete_cookie('picture')
    response.delete_cookie('expiry_time')
    response.delete_cookie('user_rank')


def search_gift(request):

    ans = dict()
    if not is_logged(request):
        ans['status'] = NOT_LOGGED_IN
        return HttpResponse(json.dumps(ans), content_type='application/json',status=400)

    body = json.loads(request.body)
    age = body['age']
    relation = body['relation']
    gender = body['gender']
    price_range = body.get('price_range')
    user_id = body['user_id']
    user = User.objects.get(user_id)
    if user.user_rank < MIN_SEARCH_RANK:
        ans['status'] = 'RankTooLow'
        return HttpResponse(json.dumps(ans), content_type='application/json',status=400)
    elif user.is_banned:
        return HttpResponse(json.dumps({'status': 'banned'}), content_type='application/json',status=400)
    rel_rng = None
    for rng in age_ranges:
        if rng[0] <= int(age) <= rng[1]:
            rel_rng = rng
            break
    if rel_rng is None:
        return HttpResponse(json.dumps({'status': 'illegalAge'}), content_type='application/json',status=400)
    # query the DB for the relevant gifts
    if price_range:
        low_price,high_price = price_range.split('-')
        gifts = Gift.objects.filter(age__range=[rel_rng[0], rel_rng[1]], gender=gender,\
                                    price__range=[int(low_price),int(high_price)])
    else:
        gifts = Gift.objects.filter(age__range=[rel_rng[0], rel_rng[1]], gender=gender)
    truncated_gifts = truncate_by_relation_strength(gifts, relation)
    truncated_gifts.sort(key=lambda x: x.gift_rank)
    truncated_gifts = truncated_gifts[:MAX_GIFTS]
    ans['gifts'] = [x.as_json() for x in truncated_gifts]
    ans['status'] = 'OK'
    return HttpResponse(json.dumps(ans), content_type='application/json')


# truncate list of gifts by the strength of their relation to the input relation
def truncate_by_relation_strength(gifts,relation):

    relations = RelationshipMatrixCell.objects.filter(rel1=relation)
    relations_dict = {}
    for rel in relations:
        relations_dict[rel.rel2] = rel.strength
    filtered_gifts = []
    for gift in gifts:
        strength = relations_dict.get(gift.relationship)
        if strength > MIN_RELATION_STRENGTH:
            filtered_gifts.append(gift)
    # gift_strength.sort(key=lambda x: x[1])

    return filtered_gifts


def login(request):
    body = json.loads(request.body)
    token_id = body['id_token']
    ans = dict()
    return HttpResponse(json.dumps({}), content_type='application/json', status=480)

    if token_id is None:
        ans['status'] = 'Missing token id'
        return HttpResponse(json.dumps(ans), content_type='application/json', status=400)

    idinfo = client.verify_id_token(token_id, GOOGLE_CLIENT_ID)

    if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
        ans['status'] = 'Not reliable issuer.'
        return HttpResponse(json.dumps(ans), content_type='application/json', status=400)

    user_id = idinfo['sub']

    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        user = None

    if not user:
        user = User(user_id=user_id)
        user.save()
    else:
        if user.is_banned:
            ans['status'] = 'User banned!'
            return HttpResponse(json.dumps(ans), content_type='application/json', status=400)

    res = HttpResponse(json.dumps(ans), content_type='application/json')

    res.set_cookie('user_id', user_id)
    res.set_cookie('given_name', idinfo['given_name'])
    res.set_cookie('picture', idinfo['picture'])
    #set cookie for 30 minutes
    res.set_cookie('expiry_time', datetime.utcnow() + timedelta(seconds=3600))
    res.set_cookie('user_rank', user.user_rank)

    return res

def logout(request):
    ans = dict()
    if not is_logged(request):
        ans['status'] = NOT_LOGGED_IN
        return HttpResponse(json.dumps(ans), content_type='application/json', status=400)
    ans['status'] = 'Logged out'
    res = HttpResponse(json.dumps(ans), content_type='application/json')
    invalidate_cookie(res)
    return res


def upload_gift(request):
    if not is_logged(request):
        return HttpResponse(json.dumps({'status': NOT_LOGGED_IN}), status=400)
    body = json.loads(request.body)
    age = body['age']
    gender = body['gender']
    price = body['price']
    image = body.get('img_url')
    description = body['description']
    relation = body['relationship']
    other_relation = body['relationship2']
    relation_strength = body['relationship_score']

    try:
        age = int(age)
        price = int(price)
    except (TypeError,ValueError):
        ans = {'status': 'invalid age/price'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')
    if not gender == 'M' and not gender == 'F':
        ans = {'status': 'wrong gender'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')
    if Relation.objects.get(description=relation) is None:
        ans = {'status': 'relation not defind'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')

    user_id = request.COOKIES.get('user_id')
    user = User.objects.get(user_id)
    if user is None:
        return HttpResponse(json.dumps({'status': 'user does not exist'}),status=400, content_type='application/json')
    gift = Gift(description=description, age=age, price=price, gender=gender, gift_img=image, relationship=relation)
    gift.uploading_user_id = user_id

    # update relationship matrix value according to user answer
    if user.user_rank > PREMIUM_USER_RANK:
        other_rel = Relation.objects.get(description=other_relation)
        try:
            rel_matrix_cell = RelationshipMatrixCell.objects.get(rel1_id=relation.pk, rel2_id=other_rel.pk)
            rel_matrix_cell.strength = rel_matrix_cell.strength + (rel_matrix_cell.strength - relation_strength)
        except TypeError:
            return HttpResponse(json.dumps({'status':'relations ratio does not exist in db'}), status=400, content_type='application/json')
        user.user_rank = user.user_rank + 1
        rel_matrix_cell.save()
    user.user_rank = user.user_rank + 2
    user.save()
    res = HttpResponse(json.dumps({'status':'OK'}), status=200,content_type='application/json')
    res.set_cookie('user_rank', user.user_rank)
    return res


def test(request):
    tmp_date = datetime.utcnow() + timedelta(seconds=1800)
    cookie = {'user_id':'117896272606849173314', 'expiry_time':tmp_date.strftime("%Y-%m-%d %H:%M:%S")}
    r = requests.post("http://localhost:63343",
                      json={'age': 25,
                            'relation': 'Parent',
                            'gender': 'M',
                            'price_range': '10-20',
                            'user_id': '117896272606849173314'
                        }, cookies = cookie)


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
                        first_rel = Relation.objects.get(description=rel)
                        second_rel = Relation.objects.get(description=col)
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


def clear_db(request):
    Relation.objects.all().delete()
    RelationshipMatrixCell.objects.all().delete()
    User.objects.all().delete()
    Gift.objects.all().delete()
    return HttpResponse(json.dumps({'status':'OK'}), status=200)


#def user_page(request):
    #body = json.loads(request.body)
    #user_id = body['user_id']
    #try:
    #    user = User.objects.get(user_id)
    #except TypeError:
    #       return HttpResponse(json.dumps({'status':' user does not exist in db'}), status=400, content_type='application/json')

    #try:
    #    user_gifts= Gift.objects.filter(uploading_user=user.user_id)
    #except


