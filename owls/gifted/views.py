from django.shortcuts import render
from django.http import HttpResponse
import json
from models import *

MIN_SEARCH_RANK = 10
age_ranges = [(0,2), (3,6), (7,10), (11,14), (15,17), (18,21), (22,25), (26,30), (31,40)]
MIN_RELATION_STRENGTH = 2
MAX_GIFTS = 50


def index(request):
    context = {}
    return render(request, 'gifted/index.html', context)


def search_gift(request):
    ans = dict()
    body = json.loads(request.body)
    age = body['age']
    relation = body['relation']
    gender = body['gender']
    price_range = body.get('price_range')
    user_id = body['user_id']
    user = User.objects.get(user_id)
    if user.user_rank < MIN_SEARCH_RANK:
        ans['status'] = 'RankTooLow'
        return HttpResponse(json.dumps(ans), content_type='application/json')
    elif user.is_banned:
        return HttpResponse(json.dumps({'status': 'banned'}), content_type='application/json')
    rel_rng = None
    for rng in age_ranges:
        if rng[0] <= ord(age) <= rng[1]:
            rel_rng = rng
            break
    if rel_rng is None:
        return HttpResponse(json.dumps({'status': 'illegalAge'}), content_type='application/json')
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

