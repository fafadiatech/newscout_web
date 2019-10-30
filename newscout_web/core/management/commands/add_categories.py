import re
import json
from django.core.management.base import BaseCommand

from news_site.models import *
from api.v1.serializers import ArticleSerializer
from news_site.utils import create_index, ingest_to_elastic


class Command(BaseCommand):
    help = 'This command is used to add categories to uncategorised products'

    batch = []

    def add_arguments(self, parser):
        parser.add_argument('--index', '-i', type=str, default='article', help='elastic search index name [default: article]')

    def get_tags(self, tags):
        """
        this method will return tag name from tags objects
        """
        tag_list = []
        for tag in tags:
            tag_list.append(tag["name"])
        return tag_list

    def handle(self, *args, **options):
        index = options['index']
        json_data = json.loads(open("categories.json").read())
        for k, v in json_data.items():
            cat_obj = Category.objects.get(name=k)
            for article in Article.objects.filter(category=Category.objects.get(name="uncategorised")).iterator():
                if any(re.search(r'\b' + word.lower() + r'\b', article.title.lower()) for word in k):
                    article.category = cat_obj
                    article.save()
                    serializer = ArticleSerializer(article)
                    json_data = serializer.data
                    if json_data["hash_tags"]:
                        tag_list = self.get_tags(json_data["hash_tags"])
                        json_data["hash_tags"] = tag_list
                    self.batch.append(json_data)

                if any(word.lower() in list(article.hash_tags.all().values_list("name", flat=True)) for word in k):
                    article.category = cat_obj
                    article.save()
                    serializer = ArticleSerializer(article)
                    json_data = serializer.data
                    if json_data["hash_tags"]:
                        tag_list = self.get_tags(json_data["hash_tags"])
                        json_data["hash_tags"] = tag_list
                    self.batch.append(json_data)

                if len(self.batch) == 999:
                    ingest_to_elastic(self.batch, index, index, 'id')
                    self.batch = []
                    print("Ingesting Batch...!!!")

        print (len(self.batch))
        ingest_to_elastic(self.batch, index, index, 'id')
        print("Ingesting Final Batch...!!!")
