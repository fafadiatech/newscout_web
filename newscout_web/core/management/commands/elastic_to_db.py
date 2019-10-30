from django.core.management.base import BaseCommand

from news_site.models import *
from api.v1.serializers import ArticleSerializer
from news_site.utils import es
from elasticsearch_dsl import Search


class Command(BaseCommand):
    help = 'This command is used to ingest data from database to elastic search'

    batch = []

    def add_arguments(self, parser):
        parser.add_argument('--index', '-i', type=str, default='article', help='elastic search index name [default: article]')

    def handle(self, *args, **options):
        print("Reading Data from elastic\n")
        index = options['index']
        size = 100
        start = 0
        while True:
            end = start + size
            sr = Search(using=es, index="article")
            sr = sr.query("match_all", **{})
            sr = sr[start:end]
            res = sr.execute()
            if res.hits:
                for doc in res.hits.hits:
                    doc = result["_source"]
            else:
                break
