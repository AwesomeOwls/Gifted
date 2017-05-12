from __future__ import unicode_literals
import os
from django.db import models


class User(models.Model):
    user_id = models.CharField(max_length=150, primary_key=True)
    user_rank = models.IntegerField(default=0)
    is_banned = models.BooleanField(default=False)

    def __str__(self):
        return "id:%s, %s, rank:%s, banned:%s" %(self.user_id,self.user_rank, "yes" if self.is_banned else "no")


class Relation(models.Model):
    RELATIONSHIP_CHOICES = (
        ('Parent', 'Parent'),
        ('Grandparent', 'Grandparent'),
        ('Sibling', 'Sibling'),
        ('Cousin','Cousin'),
        ('Parent in low', 'Parent in low'),
        ('Nephew', 'Nephew'),
        ('Friend', 'Friend'),
        ('Partner', 'Partner'),
        ('Child', 'Child'),
        ('Child in low', 'Child in low'),
        ('Grandparent in low', 'Grandparent in low'),
        ('Uncle/Aunt', 'Uncle/Aunt'),
        ('Sibling in low','Sibling in low'),
        ('Acquaintant','Acquaintant'),
        ('Colleage','Colleage'),
        ('Grandson','Grandson'),
    )
    description = models.CharField(max_length=1, choices=RELATIONSHIP_CHOICES)


class Img(models.Model):
    file = models.FileField()

    def filename(self):
        return os.path.basename(self.file.name)


class Gift(models.Model):
    uploading_user = models.ForeignKey(User)
    description = models.CharField(max_length=250)
    age = models.IntegerField()
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
    )
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    price = models.IntegerField()
    gift_img = models.ForeignKey(Img)
    gift_rank = models.IntegerField(default=0)
    uploading_time = models.DateTimeField(auto_now_add=True)
    relationship = models.ForeignKey(Relation)

    def as_json(self):
        return dict(
            description=self.description,
            price=self.price,
            gift_rank=self.gift_rank,
            gift_id=self.pk,
            gift_img=self.gift_img.filename()
        )


class RelationshipMatrixCell(models.Model):
    rel1 = models.ForeignKey(Relation, related_name='rel1')
    rel2 = models.ForeignKey(Relation, related_name='rel2')
    strength = models.IntegerField()
