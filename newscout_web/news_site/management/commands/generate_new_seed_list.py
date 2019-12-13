from urllib.parse import urlparse
from news_site.models import ScoutedItem
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'This command is used to ingest data from database to elastic search'

    def handle(self, *args, **options):
        results = []
        for item in ScoutedItem.objects.all():
            domain = urlparse(item.url, '/').netloc
            if domain not in results:
                results.append(domain)
        print("\n".join(results))