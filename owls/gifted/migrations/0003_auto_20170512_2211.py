# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-05-12 22:11
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gifted', '0002_auto_20170512_2210'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='banned_start',
            field=models.DateTimeField(null=True),
        ),
    ]
