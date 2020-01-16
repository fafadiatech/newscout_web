import math
from django.core.management.base import BaseCommand

from news_site.models import *
from django.utils import timezone
from datetime import datetime, time


class Command(BaseCommand):
    help = 'This command is used to assign articles to users'

    def create_chunks(self, obj_list, chunk_size):
        """
        devide list objects to equal chunk_size
        """
        for i in range(0, len(obj_list), chunk_size):
            yield obj_list[i:i + chunk_size]

    def handle(self, *args, **options):
        print("Assigning articles...")
        end = timezone.now().date()
        start = end - timezone.timedelta(days=6)
        start_date = datetime.combine(start, time.min)
        end_date = datetime.combine(end, time.max)

        objs = Article.objects.filter(published_on__gte=start_date, published_on__lte=end_date, edited_by__isnull=True).values_list("id", flat=True)
        users = UserProfile.objects.filter(is_staff=True)

        chunk_size = math.ceil(objs.count() / users.count())

        for chunk_list, user in zip(self.create_chunks(objs, chunk_size), users):
            article_objs = Article.objects.filter(id__in=chunk_list)
            article_objs.update(edited_by=user)
            print("Assigned {0} articles to {1}".format(len(chunk_list), user.username))

        print("Completed")
