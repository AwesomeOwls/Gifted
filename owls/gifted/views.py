from django.shortcuts import render
from django.http import HttpResponse
import json
from models import *
from oauth2client import client, crypt
from datetime import *
from dateutil import parser
import requests

MIN_SEARCH_RANK = 10
MIN_GIFT_RANK= -5
TRUST_USER_RANK= 5
MAX_REMOVED=3
age_ranges = [(0,2), (3,6), (7,10), (11,14), (15,17), (18,21), (22,25), (26,30), (31,40)]
MIN_RELATION_STRENGTH = 2
MAX_GIFTS = 50
PREMIUM_USER_RANK = 4
GOOGLE_CLIENT_ID = '905317763411-2rbmiovs8pcahhv5jn5i6tekj0hflivf.apps.googleusercontent.com'
NOT_LOGGED_IN = 'User is not logged-in'
RELATIONSHIP_CHOICES = (
        ('Parent', 'Parent'),
        ('Grandparent', 'Grandparent'),
        ('Sibling', 'Sibling'),
        ('Cousin', 'Cousin'),
        ('Parent in law', 'Parent in law'),
        ('Nephew', 'Nephew'),
        ('Friend', 'Friend'),
        ('Partner', 'Partner'),
        ('Child', 'Child'),
        ('Child in law', 'Child in law'),
        ('Grandparent in law', 'Grandparent in law'),
        ('Uncle/Aunt', 'Uncle/Aunt'),
        ('Sibling in law', 'Sibling in law'),
        ('Acquaintant', 'Acquaintant'),
        ('Colleague', 'Colleague'),
        ('Grandson', 'Grandson'),
    )


def index(request):
    context = {}
    return render(request, 'gifted/index.html', context)

def like(request):

    body = json.loads(request.body)
    user_id=body['user_id']
    like= body['like']
    gift_id= body['gift_id']

    gift= Gift.objects.get(gift_id)
    user = Gift.objects.get(user_id)
    uploader = Gift.objects.get(gift.uploading_user)

    gift.gift_rank= gift.gift_rank+like

    # User may like/dislike other gifts only if his rank is high enough.
    if user.user_rank<TRUST_USER_RANK:
        return HttpResponse(json.dumps({'ststus':'user rank too low'}),content_type='application/json',status=400)

    # Under gift rank of -5, the gift will be removed from the DB.
    if gift.gift_rank<MIN_GIFT_RANK:
        gift.delete()
        uploader.gifts_removed=uploader.gifts_removed+1
        if uploader.gifts_removed>MAX_REMOVED:
            uploader.is_banned=True
            uploader.banned_start= datetime.datetime.now()

    # if the picture is liked, the uploader gets 1 point
    if like>0:
        uploader.user_rank= uploader.user_rank+1

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
        if rng[0] <= ord(age) <= rng[1]:
            rel_rng = rng
            break
    if rel_rng is None:
        return HttpResponse(json.dumps({'status': 'illegalAge'}), content_type='application/json',status=400)
    # query the DB for the relevant gifts
    if price_range:
        low_price,high_price = price_range.split('-')
        gifts = Gift.objects.filter(age__range=[rel_rng[0], rel_rng[1]], gender=gender,\
                                    price__range=[ord(low_price),ord(high_price)])
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
    res.set_cookie('expiry_time', datetime.utcnow() + timedelta(seconds=1800))
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
    ans = dict()
    age = body['age']
    gender = body['gender']
    price = body['price']
    image = body.get('image')
    description = body['description']
    relation = body['relation']
    other_relation = body['other_relation']
    relation_strength = body['relation_strength']

    try:
        age = int(age)
        price = int(price)
    except ValueError:
        ans = {'status': 'value error'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')
    if gender is not 'M' or gender is not 'F':
        ans = {'status': 'wrong gender'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')
    if Relation.get(description=relation) is None:
        ans = {'status': 'relation not defind'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')

    user_id = request.COOKIES.get('user_id')
    user = User.get(user_id)
    if user is None:
        return HttpResponse(json.dumps({'status': 'user does not exist'}),status=400, content_type='application/json')
    gift = Gift(description=description, age=age, price=price, gender=gender, gift_img=image, relationship=relation)
    gift.uploading_user_id = user_id

    # update relationship matrix value according to user answer
    if user.user_rank > PREMIUM_USER_RANK:
        other_rel = Relation.get(description=other_relation)
        try:
            rel_matrix_cell = RelationshipMatrixCell.get(rel1_id=relation.pk, rel2_id=other_rel.pk)
            rel_matrix_cell.strength = rel_matrix_cell.strength + (rel_matrix_cell.strength - relation_strength)
        except TypeError:
            return HttpResponse(json.dumps({'status':'relations ratio does not exist in db'}), status=400, content_type='application/json')
        user.user_rank = user.user_rank + 1
        rel_matrix_cell.save()
    user.user_rank = user.user_rank + 2
    user.save()
    res = HttpResponse(json.dumps({'status':'OK'}), status=200,
                        content_type='application/json')
    res.set_cookie('user_rank', user.user_rank)
    return res







def test(request):
    r = requests.post("http://localhost:63343",
                      data={'age': 25,
                            'relation': 'Parent',
                            'gender': 'M',
                            'price_range': '10-20',
                            'user_id': '117896272606849173314'
                            })
