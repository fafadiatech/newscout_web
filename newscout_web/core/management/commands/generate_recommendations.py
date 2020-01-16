import pytz
import datetime
from random import randint
from operator import itemgetter
from elasticsearch.helpers import scan
from core.utils import es, create_index, ingest_to_elastic
from django.utils import timezone

from core.models import Domain
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'This command is used to generate recommendations'

    DEBUG = False

    def add_arguments(self, parser):
        parser.add_argument('--days', '-d', type=int, default=3, help='Generate recommendations for given days [default: last 3 days]')

    def get_recommendations(self, title, domain, size=100, K=25):
        """
        this method is used to perform title search
        """
        suggestions = []

        results = es.search(
                index='article',
                body={
                    "query": {
                        "bool" : {
                            "must": [
                                {
                                    "multi_match" : {
                                        "query": title,
                                        "fields": ["title", "blurb^3"]
                                    }
                                },
                                {
                                    "match" : {
                                        "domain": domain
                                    }
                                }
                            ]
                        }
                    },
                    "size": 100
                    })

        while len(suggestions) != K:
            rec = {}

            lucky_number = randint(0, size-1)
            try:
                candidate = results['hits']['hits'][lucky_number]
            except:
                break

            rec['id'] = candidate['_source']['id']

            if rec['id'] in suggestions:
                continue

            rec = candidate['_source']['id']
            ts = candidate['_source']['published_on']
            suggestions.append((rec, ts))

        return [item[0] for item in suggestions]

    def get_date_range(self, days=3):
        """
        this method is used to get start date and end date for article filter
        """
        end_date = timezone.now().date()
        start_date = end_date - timezone.timedelta(days=days)
        start_date = datetime.datetime.combine(start_date, datetime.time.min)
        end_date = datetime.datetime.combine(end_date, datetime.time.max)
        return start_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ"), end_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

    def handle(self, *args, **options):
        # make sure we have our recommendations index
        create_index("recommendation")
        days = options['days']
        start, end = self.get_date_range(days)

        for domain in Domain.objects.all():
            results = scan(es, index='article', query={"query": {"bool": {"must": [{"term": {"domain": domain.domain_id}}, {"range": {"published_on": {"gte": start,"lt": end}}}]}},"sort": [{"published_on": {"order": "desc"}}]}, preserve_order=True)

            for current in results:
                article_id, title, domain = current['_source']['id'], current['_source']['title'], current['_source']['domain']
                document = {}
                document['id'] = article_id
                document['recommendation'] = self.get_recommendations(title, domain)
                ingest_to_elastic([document], "recommendation", "recommendation", "id")

                if self.DEBUG:
                    print(f"Generated Recommendation for: {title}")

                    for item in document['recommendation']:
                        print("\t", item['title'])
