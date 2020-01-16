import math
import requests
from core.models import Devices, DailyDigest, Domain
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'This command is used to generate daily digest'

    batch = []

    def handle(self, *args, **options):
        for device in Devices.objects.all().iterator():
            device_id = device.device_id

            logs_url = "http://localhost:8000/event/newscout-logs/"
            params = {"device_id": device_id}
            res = requests.get(logs_url, params=params)

            if res.status_code == 200:
                data = res.json()
                if data:
                    for k, v in data.items():
                        docs_per_cat = math.ceil(20 / len(v))
                        for cat in v:
                            api_url = "http://localhost:8000/api/v1/article/search/?domain=" + k
                            params = {"category": cat}
                            res = requests.get(api_url, params=params)
                            if res.status_code == 200:
                                if res.json():
                                    results = res.json()["body"]["results"][:docs_per_cat]
                                    self.batch.extend(results)

                        if self.batch:
                            article_ids = [i["id"] for i in self.batch]
                            domain = Domain.objects.filter(domain_id=k).first()
                            dd, _ = DailyDigest.objects.get_or_create(device=device, domain=domain)
                            dd.articles.remove(*dd.articles.all())
                            dd.articles.add(*article_ids)
                            dd.save()
                            self.batch = []
