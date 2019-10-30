from random import randint
from core.models import Article, CategoryDefaultImage
from django.core.management.base import BaseCommand

from api.v1.serializers import ArticleSerializer
from core.utils import create_index, ingest_to_elastic

class Command(BaseCommand):
    help = 'This command is used to update missing images'

    batch = []

    def get_tags(self, tags):
        """
        this method will return tag name from tags objects
        """
        tag_list = []
        for tag in tags:
            tag_list.append(tag["name"])
        return tag_list

    def handle(self, *args, **options):
        index = 'article'

        for current in Article.objects.filter(cover_image=""):
            cover_image_url = CategoryDefaultImage.get_default_image(current.category)
            current.cover_image = cover_image_url
            current.save()
            print(current.id, current, current.category, cover_image_url)
            serializer = ArticleSerializer(current)
            json_data = serializer.data

            if json_data["hash_tags"]:
                tag_list = self.get_tags(json_data["hash_tags"])
                json_data["hash_tags"] = tag_list
            self.batch.append(json_data)

            if len(self.batch) == 999:
                ingest_to_elastic(self.batch, index, index, 'id')
                self.batch = []
                print("Ingesting Batch...!!!")
        ingest_to_elastic(self.batch, index, index, 'id')