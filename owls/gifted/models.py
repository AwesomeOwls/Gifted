from __future__ import unicode_literals
from django.db import models
import json


class User(models.Model):
    user_id = models.CharField(max_length=150, primary_key=True)
    user_rank = models.IntegerField(default=0)
    gifts_removed = models.IntegerField(default=0)
    is_banned = models.BooleanField(default=False)
    banned_start = models.DateTimeField(null=True, blank=True)
    liked_gift_ids = models.TextField(default='[]', blank=True)

    def add_liked_gift_id(self, gift_obj):
        liked_gifts = self.get_liked_gift_ids()
        liked_gifts.append(gift_obj)
        self.liked_gift_ids = json.dumps(liked_gifts)

    def get_liked_gift_ids(self):
        return json.loads(self.liked_gift_ids)

    def __str__(self):
       return "id:%s, rank:%s, banned:%s, liked gift ids:%s" % (self.user_id, self.user_rank, "yes" if self.is_banned else "no", self.liked_gift_ids)


class Relation(models.Model):
    RELATIONSHIP_CHOICES = (
        ('parent', 'Parent'),
        ('grandparent', 'Grandparent'),
        ('sibling', 'Sibling'),
        ('cousin','Cousin'),
        ('parent_in_law', 'Parent in law'),
        ('nephew', 'Nephew'),
        ('friend', 'Friend'),
        ('partner', 'Partner'),
        ('child', 'Child'),
        ('child_in_law', 'Child in law'),
        ('grandparent_in_law', 'Grandparent in law'),
        ('uncle_aunt', 'Uncle/Aunt'),
        ('sibling_in_law','Sibling in law'),
        ('acquaintant','Acquaintant'),
        ('colleague','Colleague'),
        ('grandson','Grandson'),
    )
    description = models.CharField(max_length=30, choices=RELATIONSHIP_CHOICES, primary_key=True)

    def __str__(self):
        return "%s" % self.description


class Gift(models.Model):
    uploading_user = models.ForeignKey(User,db_index=True)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=250)
    age = models.IntegerField(db_index=True)
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
    )
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, db_index=True)
    price = models.IntegerField(db_index=True)
    gift_img = models.CharField(max_length=500)
    gift_rank = models.IntegerField(default=0)
    uploading_time = models.DateTimeField(auto_now_add=True)
    relationship = models.ForeignKey(Relation)
    liked_users = models.TextField(default='[]', blank=True)

    def add_liked_user(self, like_obj):
        liked_users = self.get_liked_users()
        liked_users.append(like_obj)
        self.liked_users = json.dumps(liked_users)

    def get_liked_users(self):
        return json.loads(self.liked_users)

    def as_json(self):
        return dict(
            description=self.description,
            title=self.title,
            price=self.price,
            gift_rank=self.gift_rank,
            gift_id=self.pk,
            gift_img=self.gift_img,
            relationship=str(self.relationship),
            liked_users=self.liked_users
        )

    def __str__(self):
       return "title:%s, description:%s, uploading user:%s, price:%s, liked users:%s" % (self.title, self.description, self.uploading_user, self.price, self.liked_users)


class RelationshipMatrixCell(models.Model):
    rel1 = models.ForeignKey(Relation, related_name='rel1',db_index=True)
    rel2 = models.ForeignKey(Relation, related_name='rel2',db_index=True)
    strength = models.FloatField()

    def __str__(self):
        return "%s, %s, %f" % (self.rel1.description, self.rel2.description, self.strength)
