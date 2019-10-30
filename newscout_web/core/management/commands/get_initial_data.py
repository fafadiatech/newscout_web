from django.core.management.base import BaseCommand

from news_site.models import *
from api.v1.serializers import ArticleSerializer
from news_site.utils import create_index, ingest_to_elastic
from django.core import serializers
from collections import OrderedDict


class Command(BaseCommand):
    help = 'This command is used to ingest data from database to elastic search'

    batch = []

    def handle(self, *args, **options):
        app_list = OrderedDict()

        domain = Domain.objects.get(domain_id="newscout")
        categories = []
        articles = []
        sources = []
        hash_tags = []
        submenus = []
        menus = Menu.objects.filter(domain=domain)
        print("getting menus")
        for m in menus:
            categories.append(m.name)
            for s in m.submenu.all():
                categories.append(s.name)
                submenus.append(s)
                for h in s.hash_tags.all():
                    if h not in hash_tags:
                        hash_tags.append(h)
        print("getting articles")
        for cat in categories:
            arts = Article.objects.filter(category=cat, domain=domain)[:200]
            for art in arts:
                articles.append(art)
                if art.source not in sources:
                    sources.append(art.source)
                for hashtag in art.hash_tags.all():
                    if hashtag not in hash_tags:
                        hash_tags.append(hashtag)
        users = UserProfile.objects.all()
        print("getting users")
        for user in users:
            for p in user.passion.all():
                if p not in hash_tags:
                    hash_tags.append(p)
        trendingarticles = []
        print("getting trendingarticles")
        for tart in TrendingArticle.objects.filter(domain=domain):
            trendingarticles.append(tart)
            for art in tart.articles.all():
                articles.append(art)
                if art.source not in sources:
                    sources.append(art.source)
                for hashtag in art.hash_tags.all():
                    if hashtag not in hash_tags:
                        hash_tags.append(hashtag)
        devices = Devices.objects.filter(user__in=users)
        dailydigest = []
        print("getting dailydigest")
        for d in DailyDigest.objects.filter(device__in=devices):
            dailydigest.append(d)
            for art in d.articles.all():
                if art.domain == domain:
                    articles.append(art)
                    if art.source not in sources:
                        sources.append(art.source)
                    for hashtag in art.hash_tags.all():
                        if hashtag not in hash_tags:
                            hash_tags.append(hashtag)
        app_list['news_site.domain'] = [domain]
        app_list['news_site.category'] = categories
        app_list['news_site.categoryassociation'] = CategoryAssociation.objects.filter(parent_cat__in=categories, child_cat__in=categories)
        app_list['news_site.categorydefaultimage'] = CategoryDefaultImage.objects.filter(category__in=categories)
        app_list['news_site.source'] = sources
        app_list['news_site.hashtag'] = hash_tags
        app_list['news_site.userprofile'] = users
        app_list['news_site.article'] = articles
        app_list['news_site.articlemedia'] = ArticleMedia.objects.filter(article__in=articles)
        app_list['news_site.submenu'] = submenus
        app_list['news_site.menu'] = menus
        app_list['news_site.devices'] = Devices.objects.filter(user__in=users)
        app_list['news_site.trendingarticle'] = trendingarticles
        app_list['news_site.dailydigest'] = dailydigest

        for name, values in app_list.items():
            data = serializers.serialize("json", values)
            file_name = name + '.json'
            f = open(file_name, 'w')
            f.write(data)
            f.close()
