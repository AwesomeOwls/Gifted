from django.shortcuts import render
from oauth2client import client
import re
from utils import *


def index(request):
    context = {}
    if request.method != 'GET':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)

    if 'user_id' in request.COOKIES:
        user_id = request.COOKIES.get('user_id')
        user = User.objects.get(user_id=user_id)
        response = render(request, 'gifted/index.html', context)
        refresh_cookie(response, user)
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
    except User.DoesNotExist:
        user = None

    if not user:
        user = User(user_id=user_id)
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
    if res is not None:
        return res

    ans['status'] = 'Logged out'
    res = HttpResponse(json.dumps(ans), content_type='application/json', status=200)
    invalidate_cookie(res)
    return res


def search(request):
    if not request.body or request.method != 'POST':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)
    else:
        body = json.loads(request.body)

    ans = {}
    res = check_logged(request)
    if res is not None:
        return res

    age = age_range = None
    if '-' in body['age']:
        age_range = body['age']
    else:
        age = body['age']
    relation = body['relationship']
    gender = body['gender']
    price_range = body.get('price')
    user_id = request.COOKIES.get('user_id')
    user = User.objects.get(user_id=user_id)
    low_price = high_price = None
    low_age = high_age = None

    if price_range:
        low_price, high_price = price_range.split('-')

    # ////input validations////
    try:
        if age:
            age = int(age)
        low_price = int(low_price)
        high_price = int(high_price)

        if low_price < 0 or high_price <= 0 or high_price < low_price:
            ans = {'status': 'Prices must be positive integers and high price must be higher then lower price'}
            return HttpResponse(json.dumps(ans), status=400, content_type='application/json')

        if age and age <= 0 or age >= 200:
            ans = {'status': 'Age/price must be positive. Age cannot be over 200'}
            return HttpResponse(json.dumps(ans), status=400, content_type='application/json')
        elif age_range:
            low_age, high_age = age_range.split('-')
            low_age = int(low_age)
            high_age = int(high_age)

            if low_age <= 0 or high_age <= 0 or high_age < low_age:
                ans = {'status': 'Ages must be positive.Higher age must be higher then lower age'}
                return HttpResponse(json.dumps(ans), status=400, content_type='application/json')

    except (TypeError, ValueError):
        ans = {'status': 'Age/price must be integers'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')

    # ////end of input validations////

    if user is None:
        return HttpResponse(json.dumps({'status': 'User does not exist'}),status=400, content_type='application/json')

    if user.user_rank < TRUSTED_USER_RANK:
        ans['status'] = 'Your rank is too low. \nYou need to upload few gifts before searching. \nCheck out our FAQ.'
        return HttpResponse(json.dumps(ans), content_type='application/json',status=400)

    ages_rng = None
    if age_range is None:
        for rng in age_ranges:
            if rng[0] <= int(age) <= rng[1]:
                ages_rng = rng
                break
        if ages_rng is None:
            # should not get here at all
            return HttpResponse(json.dumps({'status': 'No suitable range in range array.'}), content_type='application/json',status=400)
    else:
        ages_rng = [int(low_age),int(high_age)]

    # query the DB for the relevant gifts
    if price_range:
        if gender != 'U':
            gifts = Gift.objects.filter(age__range=[ages_rng[0], ages_rng[1]], gender=gender,
                                    price__range=[int(low_price), int(high_price)])
        else:
            gifts = Gift.objects.filter(age__range=[ages_rng[0], ages_rng[1]],
                                    price__range=[int(low_price), int(high_price)])
    else:
        # no asked price was given
        if gender != 'U':
            gifts = Gift.objects.filter(age__range=[ages_rng[0], ages_rng[1]], gender=gender)
        else:
            gifts = Gift.objects.filter(age__range=[ages_rng[0], ages_rng[1]])

    # if relevant gifts were found
    if gifts:
        truncated_gifts = truncate_by_relation_strength(gifts, relation, user_id)
        truncated_gifts.sort(key=lambda gift: gift.gift_rank, reverse=True)
        truncated_gifts = truncated_gifts[:MAX_GIFTS]
        ans['gifts'] = [x.as_json() for x in truncated_gifts]

    ans['status'] = 'OK'
    response = HttpResponse(json.dumps(ans), content_type='application/json', status=200)
    refresh_cookie(response,user)
    return response


def upload_gift(request):
    if not request.body or request.method != 'POST':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)
    else:
        body = json.loads(request.body)

    ans = {}
    res = check_logged(request)
    if res is not None:
        return res

    age = body['age']
    gender = body['gender']
    price = body['price']
    image_url = body.get('img_url')
    description = body['description']
    title = body['title']
    relation = body['relationship']
    other_relation = body['relationship2']
    relation_strength = body['relationship_score']

    ##### input validation #####

    try:
        age = int(age)
        price = int(price)
        if age <= 0 or age >= 200 or price <= 0:
            ans = {'status': 'Age/price must be positive integers where age cannot be over 200'}
            return HttpResponse(json.dumps(ans), status=400, content_type='application/json')
    except (TypeError, ValueError):
        ans = {'status': 'Age/price must be integers'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')

    # check if the url string is a valid url or an empty string
    if not re.match('(http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+)?',image_url):
        ans = {'status': 'Image url is invalid'}
        return HttpResponse(json.dumps(ans), status=400, content_type='application/json')

    if not re.match('(\w+(\s\w+)?)',title):
        return HttpResponse(json.dumps({'status': 'Title is not legal.\nPlease use only English letters or digits.'}), status=400, content_type='application/json')

    if not re.match('(\w+(\s\w+)?)?',description):
        return HttpResponse(json.dumps({'status':'The descreption is not legal.Please use only English letters or digits'}),
                            status=400, content_type='application/json')

    if not gender == 'M' and not gender == 'F':
        ans = {'status': 'Wrong gender supplied'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')

    ##### end of input validation #####

    rel = Relation.objects.get(description=relation)
    if rel is None:
        ans = {'status': 'Relation is not defined'}
        return HttpResponse(json.dumps(ans), status=400,content_type='application/json')

    user_id = request.COOKIES.get('user_id')
    user = User.objects.get(user_id=user_id)
    if user is None:
        return HttpResponse(json.dumps({'status': 'User does not exist'}), status=400, content_type='application/json')

    # check if gift already exists in DB
    if Gift.objects.filter(title=title, description=description, age=age, price=price,
                            gender=gender, gift_img=image_url, relationship=rel).exists():
        return HttpResponse(json.dumps({'status': 'Gift you are trying to upload already exists in our DB'}), status=400, content_type='application/json')

    gift = Gift(title=title, description=description, age=age, price=price,
                gender=gender, gift_img=image_url, relationship=rel)
    gift.uploading_user_id = user_id
    gift.save()

    # update relationship matrix value according to user answer
    if relation_strength != NOT_CHOSEN and user.user_rank > PREMIUM_USER_RANK:
        other_rel = Relation.objects.get(description=other_relation)
        update_rmatrix(rel, other_rel, relation_strength, user)

    user.user_rank = user.user_rank + 2
    user.save()
    ans['status'] = 'OK'
    res = HttpResponse(json.dumps(ans), status=200, content_type='application/json')
    res.set_cookie('user_rank', user.user_rank)
    refresh_cookie(res, user)
    return res


def like(request):

    if not request.body or request.method != 'POST':
        return HttpResponse(json.dumps({'status': 'Illegal request. Please try again.'}), status=400)
    else:
        body = json.loads(request.body)

    ans = {}
    res = check_logged(request)
    if res is not None:
        return res

    user_id = request.COOKIES.get('user_id')
    like = body['like']
    gift_id = body['gift_id']

    try:
        gift = Gift.objects.get(pk=gift_id)
        user = User.objects.get(user_id=user_id)
        uploader = User.objects.get(user_id=gift.uploading_user.user_id)
    except User.DoesNotExist, Gift.DoesNotExist:
        return HttpResponse(json.dumps({'status': 'Gift/User/Uploader not found'}), status=400)

    # User may like/dislike other gifts only if his rank is high enough.
    if user.user_rank < TRUSTED_USER_RANK:
        return HttpResponse(json.dumps({'status': 'You have to be a trusted user in order to like. \
                                                  \nCheck out our ranking system in FAQ.'}),
                            content_type='application/json', status=400)

    search_query = {'gift_id':gift_id,'is_like': 1 if like>0 else 0}

    liked_gifts_ids = user.get_liked_gift_ids()

    # check if user already liked/disliked this gift
    if search_query in liked_gifts_ids:

        return HttpResponse(json.dumps({'status': 'You already liked this gift'}),
                            content_type='application/json', status=400) if like > 0 \
            else HttpResponse(json.dumps({'status': 'You already disliked this gift'}),
                            content_type='application/json', status=400)

    elif {'gift_id':gift_id, 'is_like': 1-search_query['is_like']} in liked_gifts_ids:
        for gift_obj in liked_gifts_ids:
            if gift_obj['gift_id'] == gift_id:
                gift_obj['is_like'] = 1 - gift_obj['is_like']
                break
        user.liked_gift_ids = json.dumps(liked_gifts_ids)

        liked_users = gift.get_liked_users()
        for user_obj in liked_users:
            if user_obj['user_id'] == user.user_id:
                user_obj['is_like'] = 1 - user_obj['is_like']
                uploader.user_rank += int(like)
                break
        gift.liked_users = json.dumps(liked_users)

    else:
        if like > 0:
            uploader.user_rank += 1
        # add liked gift id to list
        user.add_liked_gift_id(search_query)
        gift.add_liked_user({'user_id': user_id, 'is_like': 1 if like > 0 else 0 })

    user.save()

    gift.gift_rank = gift.gift_rank + int(like)

    # Under gift rank of MIN_GIFT_RANK, the gift will be removed from the DB.
    if gift.gift_rank <= MIN_GIFT_RANK:
        gift.delete()
        uploader.gifts_removed += 1
        if uploader.gifts_removed > MAX_REMOVED:
            uploader.is_banned = True
            uploader.banned_start = datetime.utcnow()

    else:
        gift.save()

    uploader.save()
    ans['status'] = 'Like is succesfully done.'
    response = HttpResponse(json.dumps(ans), status=200)
    refresh_cookie(response,user)
    return response


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
    except Relation.DoesNotExist:
        return HttpResponse(json.dumps({'status': 'relation does not exist in db'}), status=400,
                            content_type='application/json')

    relation_strength = body['strength']
    update_rmatrix(rel, other_rel, relation_strength, user)

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

    except User.DoesNotExist:
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

    if body['card_type']=='gold':
        user.user_rank-=150
    elif body['card_type']=='diamond':
        user.user_rank-=250
    else:
        return HttpResponse(json.dumps({'status': 'Card type is not legal'}), status=400, content_type='application/json')

    user.save()
    ans['status'] = 'OK'
    response = HttpResponse(json.dumps(ans), content_type='application/json', status=200)
    response.set_cookie('user_rank', user.user_rank)
    refresh_cookie(response,user)
    return response
