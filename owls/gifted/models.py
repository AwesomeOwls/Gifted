from __future__ import unicode_literals
import uuid
from django.db import models


class User(models.Model):
    user_id = models.IntegerField()
    user_name = models.CharField(max_length=100)
    user_rank = models.IntegerField(default=0)
    is_banned = models.BooleanField(default=False)


class Gift(models.Model):
    gift_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True) #automatically generated unique id
    uploading_user = models.ForeignKey(User) #reference to uploading user
    description = models.CharField(max_length=250)
    age = models.IntegerField(default=0)
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
    )
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    price_lower_bound = models.IntegerField(default=0)
    price_upper_bound = models.IntegerField(default=0)

    image_file = models.FileField(default=None)
    gift_rank = models.IntegerField(default=0)
    uploading_time = models.DateTimeField(auto_now_add=True)


class RelationshipID(models.Model):
    relationship_id = models.IntegerField(default=0)
    description = models.CharField(max_length=100)
    gift_rel = models.ForeignKey(Gift)


class RMatrix(models.Model):
    description = models.CharField(max_length=100, default="Relationship Matrix", editable=False)


class RMatrixCell(models.Model):
    matrix = models.ForeignKey(RMatrix, on_delete=models.CASCADE)
    row = models.IntegerField()
    col = models.IntegerField()
    rel_strength = models.IntegerField()




