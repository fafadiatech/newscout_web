from django.core.management.base import BaseCommand
from core.models import Article, TrendingHashTag
from django.db.models import Count
from datetime import datetime
from datetime import timedelta
import pytz

class Command(BaseCommand):
    """
    This class is used to get trending hash tag based on daily, weekly and monthly basis
    for daily you have to run command: python manage.py trending_hash_tag_monthly 1
    for weekly: python manage.py trending_hash_tag_monthly 7
    for monthly: python manage.py trending_hash_tag_monthly 30
    """
    help = 'This command used to get hash_tag based on daily, weekly and monthly basis'

    def add_arguments(self, parser):
        parser.add_argument('days', type=int, help='Indicates the number of days')

    def handle(self, *args, **kwargs):
        days = kwargs['days']
        end = datetime.utcnow()
        pst = pytz.timezone('Asia/Kolkata')
        end = pst.localize(end)
        utc = pytz.UTC
        end = end.astimezone(utc)
        start = end - timedelta(days=days)
        articles = Article.objects.all()
        hash_tags = articles.filter(published_on__range=(start,end)).values('hash_tags__name').annotate(total=Count('hash_tags')).order_by('-total')[:10]  
        TrendingHashTag.objects.all().delete()
        for tags in hash_tags.iterator():
            for tag in tags.values():
                TrendingHashTag.objects.create(name=tag)
                break
