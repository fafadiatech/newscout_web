from django.core.management.base import BaseCommand

from news_site.models import Article
from api.v1.serializers import ArticleSerializer
from news_site.utils import delete_from_elastic
from django.db.models import Count


class Command(BaseCommand):
    help = 'This command is used to remove duplicate articles from database'

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
        print("Removing Duplicates\n")
        index = options['index']
        count = 0
        dups = Article.objects.filter(spam=False).values('source_url').annotate(count=Count('id')).values('source_url').filter(count__gt=1)
        for dup in dups:
            dup_articles = Article.objects.filter(source_url=dup["source_url"])
            if dup_articles.count() > 1:
                dup_articles = list(dup_articles)
                dup_articles.pop()
                for article in dup_articles:
                    article.spam = True
                    article.save()
                    count += 1
                    serializer = ArticleSerializer(article)
                    json_data = serializer.data
                    if json_data["hash_tags"]:
                        tag_list = self.get_tags(json_data["hash_tags"])
                        json_data["hash_tags"] = tag_list
                    try:
                        delete_from_elastic([json_data], index, index, 'id')
                    except Exception as e:
                        print(e)
        print("Removed {0} duplicate articles".format(count))
