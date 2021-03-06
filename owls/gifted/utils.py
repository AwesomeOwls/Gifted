"""
#           utils file                                 #
#  includes 'private' functions and constants          #
#  functions that are for inner backend use.           #
#  They don't return http responses or used as scripts #

"""


from django.http import HttpResponse,HttpRequest
from models import *
import csv
from dateutil import parser
from datetime import *
from random import  randint
from django.core.exceptions import ObjectDoesNotExist
import smtplib
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
import os
import requests
import mimetypes
import time


GOOGLE_CLIENT_ID = '905317763411-2rbmiovs8pcahhv5jn5i6tekj0hflivf.apps.googleusercontent.com'

COOKIE_EXPIRY_TIME = 3600
UPLOAD_AWARD = 2
MIN_GIFT_RANK = -5
MIN_GIFTS_TH = 5
TRUSTED_USER_RANK = 4
MAX_REMOVED = 3
MIN_RELATION_STRENGTH = 2
MAX_GIFTS = 50
PREMIUM_USER_RANK = 10
NOT_CHOSEN = 6
BAN_TIME = timedelta(1)

NOT_LOGGED_IN = 'You are not logged in.'
COOKIE_EXPIRED = 'Your session has expired. Please log-in again.'
BANNED = 'You are temporarily banned. Check our FAQ for more information.'
EMAIL_ERR = 'Failed sending email.'

GMAIL_MAIL = 'giftedcrowdsourcing@gmail.com'
GMAIL_PASS = 'adminadmin'
GIFTCARD_GOLD_PATH = 'gifted/static/gifted/img/giftcard_50.png'
GIFTCARD_DIAMOND_PATH = 'gifted/static/gifted/img/giftcard_100.png'

SPAM_TIME_TH = 5000
SPAM_GIFT_TH = 5

age_ranges = [(0,1), (2,3), (4,5),(6,8),
              (9,11), (12,14), (15,19),
              (20,25), (26,30), (31,40),
              (41,50), (51,60), (61,70),
              (71,200)]


def current_milli_time():
    return int(round(time.time() * 1000))


def is_image_url(url):
    try:
        r = requests.head(url)
    except:
        return False
    mimetype, encoding = mimetypes.guess_type(url)
    return mimetype and mimetype.startswith('image') and r.status_code == requests.codes.ok


def is_spammer(liked_gifts_ids):
    first_dislike_found = False
    first_dislike_ts = 0
    last_dislike_ts = 0
    dislike_counter = 0
    for liked_obj in reversed(liked_gifts_ids):
        if not first_dislike_found and liked_obj['is_like'] == 0:
            first_dislike_ts = liked_obj['timestamp']
            first_dislike_found = True
            dislike_counter += 1
        elif liked_obj['is_like'] == 0:
            dislike_counter += 1
            last_dislike_ts = liked_obj['timestamp']

        if dislike_counter == SPAM_GIFT_TH and first_dislike_ts - last_dislike_ts <= SPAM_TIME_TH:
            return True
    return False


def send_mail_reward(user_mail, is_gold):
    ans = dict()
    if is_gold:
        img_data = open(GIFTCARD_GOLD_PATH, 'rb').read()
    else:
        img_data = open(GIFTCARD_DIAMOND_PATH, 'rb').read()

    try:
        msg = MIMEMultipart()
        msg['Subject'] = 'Congratulations, you won a giftcard!'
        msg['From'] = GMAIL_MAIL
        msg['To'] = user_mail

        text = MIMEText("You can redeem your giftcard in selected stores. Please contact us for more information at support@gifted.com")
        msg.attach(text)

        if is_gold:
            image = MIMEImage(img_data, name=os.path.basename(GIFTCARD_GOLD_PATH))
        else:
            image = MIMEImage(img_data, name=os.path.basename(GIFTCARD_DIAMOND_PATH))

        msg.attach(image)

        server = smtplib.SMTP('smtp.gmail.com:587')
        server.ehlo()
        server.starttls()
        server.login(GMAIL_MAIL, GMAIL_PASS)
        server.sendmail(GMAIL_MAIL, user_mail, msg.as_string())
        server.quit()
    except smtplib.SMTPException:
        ans['status'] = EMAIL_ERR
        return HttpResponse(json.dumps(ans), content_type='application/json', status=400)
    return None


def check_logged(request):
    ans = dict()
    req_user_id = request.COOKIES.get('user_id')
    req_expiry_time = request.COOKIES.get('expiry_time')

    if 'user_id' in request.COOKIES:

            if not User.objects.filter(user_id=req_user_id).exists():
                ans['status'] = NOT_LOGGED_IN
                ans['status_code'] = 400
                res = HttpResponse(json.dumps(ans), content_type='application/json', status=400)
                invalidate_cookie(res)

            elif User.objects.get(user_id=req_user_id).is_banned:
                ans['status'] = BANNED
                ans['status_code'] = 405
                res = HttpResponse(json.dumps(ans), content_type='application/json', status=405)
                #invalidate_cookie(res)

            elif parser.parse(req_expiry_time) < datetime.utcnow():
                ans['status'] = COOKIE_EXPIRED
                ans['status_code'] = 405
                res = HttpResponse(json.dumps(ans), content_type='application/json', status=400)
                #invalidate_cookie(res)
            else:
                return None
    else:
        ans['status'] = NOT_LOGGED_IN
        ans['status_code'] = 400
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


def update_rmatrix(rel, other_rel, rel_strength, user):

    try:
        rel_matrix_cell = RelationshipMatrixCell.objects.get(rel1_id=rel.pk, rel2_id=other_rel.pk)
    except ObjectDoesNotExist:
        rel_matrix_cell = RelationshipMatrixCell.objects.get(rel1_id=other_rel.pk, rel2_id=rel.pk)

    try:

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


def init_relations(request):
    try:
        init_relationship_matrix()
    except (IOError, ValueError, TypeError):
        return HttpResponse(json.dumps({'status':'error'}), status=400)
    return HttpResponse(json.dumps({'status':'OK'}), status=200)


def init_gifts(request):
    start = request.GET.get('start')
    if not start:
        start = 0
    start = int(start)
    try:
        with open('../gifts.csv', 'r+') as rel_matrix_file:
            reader = csv.reader(rel_matrix_file)
            next(reader)  # skip columns names
            users = User.objects.all()
            for x in range(start-2):
                next(reader)
            i=0
            for row in reader:
                indx = randint(0,len(users)-1)
                user = users[indx]
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


# remove last SPAM_GIFT_TH dislikes of the banned user
def remove_likes_of_banned_user(user):
    user_id = user.user_id
    liked_gifts_ids = user.get_liked_gift_ids()
    counter = 0
    for gift_obj in reversed(liked_gifts_ids):
        if gift_obj['is_like'] == 0:
            gift = Gift.objects.get(pk=gift_obj['gift_id'])
            gift.remove_liked_user(user_id)
            gift.save()
            liked_gifts_ids.remove(gift_obj)
            counter += 1
        if counter == SPAM_GIFT_TH:
            break
    user.liked_gift_ids = liked_gifts_ids


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

