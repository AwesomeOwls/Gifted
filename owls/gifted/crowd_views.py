from django.shortcuts import render
from oauth2client import client
from utils import *


def index(request):
    context = {}
    if request.method != 'GET':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)

    if 'user_id' in request.COOKIES:
        user_id = request.COOKIES.get('user_id')
        response = render(request, 'gifted/index.html', context)
        try:
            user = User.objects.get(user_id=user_id)
            refresh_cookie(response, user)
        except ObjectDoesNotExist:
            invalidate_cookie(response)
        return response

    return render(request, 'gifted/index.html', context)


def login(request):
    if not request.body or request.method != 'POST':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)
    else:
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
    except ObjectDoesNotExist:
        user = None

    if not user:
        user = User(user_id=user_id, email=idinfo['email'])
        user.save()
    else:
        if user.is_banned:
            # check if ban is over
            if (datetime.utcnow().replace(tzinfo=None) - user.banned_start.replace(tzinfo=None)) < BAN_TIME:
                ans['status'] = 'Sorry you are banned! Check out our banning policy in FAQ.'
                return HttpResponse(json.dumps(ans), content_type='application/json', status=400)
            else:
                user.is_banned = False
                user.banned_start = None
                user.gifts_removed = 0
                user.save()

    res = HttpResponse(json.dumps(ans), content_type='application/json', status=200)

    res.set_cookie('user_id', user_id)
    res.set_cookie('given_name', idinfo['given_name'])
    res.set_cookie('picture', idinfo['picture'])
    # set cookie for COOKIE_EXPIRY_TIME sec
    res.set_cookie('expiry_time', datetime.utcnow() + timedelta(seconds=COOKIE_EXPIRY_TIME))
    res.set_cookie('user_rank', user.user_rank)
    res.set_cookie('removed_gifts_count', user.gifts_removed)

    return res


def logout(request):
    if request.method != 'POST':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)
    ans = {}
    res = check_logged(request)

    #special treatment for ban and cookie expiration
    if res is not None and json.loads(res.content)['status_code'] != 405:
        return res

    ans['status'] = 'Logged out'
    res = HttpResponse(json.dumps(ans), content_type='application/json', status=200)
    invalidate_cookie(res)
    return res


def ask_user(request):

    if not request.body or request.method != 'POST':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)
    else:
        body = json.loads(request.body)

    ans = {}
    res = check_logged(request)
    if res is not None:
        return res

    user_id = request.COOKIES.get('user_id')
    user = User.objects.get(user_id=user_id)

    try:
        rel = Relation.objects.get(description=body['relation'])
        other_rel = Relation.objects.get(description=body['other_relation'])
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({'status': 'relation does not exist in db'}), status=400,
                            content_type='application/json')

    relation_strength = body['strength']
    update_rmatrix(rel, other_rel, relation_strength, user)

    user.user_rank += 1
    user.save()
    ans['status'] = 'OK'
    response = HttpResponse(json.dumps(ans), content_type='application/json', status=200)
    response.set_cookie('user_rank', user.user_rank)
    refresh_cookie(response,user)
    return response


def profile_page(request):

    if request.method != 'POST':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)

    ans = {}
    res = check_logged(request)
    if res is not None:
        return res

    user_id = request.COOKIES.get('user_id')

    try:
        user = User.objects.get(user_id=user_id)
        user_gifts = Gift.objects.filter(uploading_user=user)

    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({'status': 'User not found'}), status=400)

    ans['gifts'] = [x.as_json() for x in user_gifts]
    ans['status'] = 'OK'

    response = HttpResponse(json.dumps(ans), status=200)
    refresh_cookie(response,user)
    return response


def redeem_giftcard(request):

    if not request.body or request.method != 'POST':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)
    else:
        body = json.loads(request.body)

    ans = {}
    res = check_logged(request)
    if res is not None:
        return res

    user_id = request.COOKIES.get('user_id')
    user = User.objects.get(user_id=user_id)
    is_gold = False

    if body['card_type']=='gold':
        is_gold = True
        user.user_rank-=150
    elif body['card_type']=='diamond':
        user.user_rank-=250
    else:
        return HttpResponse(json.dumps({'status': 'Card type is not legal'}), status=400, content_type='application/json')

    user.save()

    res = send_mail_reward(user.email, is_gold)
    if res is None:
        ans['status'] = 'OK'
        res = HttpResponse(json.dumps(ans), content_type='application/json', status=200)

    res.set_cookie('user_rank', user.user_rank)
    refresh_cookie(res, user)
    return res

