import requests
from django.core.management.base import BaseCommand
import json
from news_site.models import *
from django.utils import timezone
from datetime import datetime, time
import os


class Command(BaseCommand):
    help = 'This command is used to get data'

    def get_tested_ids(self, name):
        ids = []
        file_path = "ml_test/{0}.json".format(name)
        if os.path.isfile(file_path):
            f = open(file_path)
            data = json.loads(f.read())
            for i in data["body"]["results"]:
                ids.append(i["id"])
        return ids

    def handle(self, *args, **options):
        cats = [140, 141, 142, 143, 144, 146, 147, 148, 132, 133, 134, 135, 136, 160, 169, 137, 138, 139, 159, 158, 164, 124, 125, 126, 127, 128, 129, 130, 131, 162, 165, 149, 150, 151, 152, 153, 154, 155, 156, 123, 163, 166, 167, 168]

        for cat in cats:
            cat_obj = Category.objects.get(id=id)
            articles = Article.objects.filter(category=cat_obj)