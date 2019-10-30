import requests
from django.core.management.base import BaseCommand
import json
from news_site.models import *
from django.utils import timezone
from datetime import datetime, time


class Command(BaseCommand):
    help = 'This command is used to get data'

    def handle(self, *args, **options):
        # cats = Category.objects.all()
        cats = [140, 141, 142, 143, 144, 146, 147, 148, 132, 133, 134, 135, 136, 160, 169, 137, 138, 139, 159, 158, 164, 124, 125, 126, 127, 128, 129, 130, 131, 162, 165, 149, 150, 151, 152, 153, 154, 155, 156, 123, 163, 166, 167, 168]
        for cat in cats:
            cat_obj = Category.objects.get(id=cat)
            url = "http://www.newscout.in/api/v1/article/search/?category={0}&rows=250&page=2".format(cat)
            res = requests.get(url)
            data = res.json()
#            titles = []
#            for doc in data["body"]["results"]:
#                titles.append(doc["title"])
            file_name = "{0}.json".format(cat_obj.name.lower().replace(" ", "_").replace("/", "_"))
#            f = open(file_name, "w")
            with open(file_name, "w") as f:
                json.dump(data, f)
#            lines = "\n".join(titles)
#            f.write(lines.encode("ascii", "ignore"))
#            f.close()
