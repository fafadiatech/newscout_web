import os
import sys
import zlib
import pytz
import time
import redis
import cPickle
from random import randint
from datetime import datetime
from dateutil.parser import parse
from django.core.management.base import BaseCommand, CommandError

from news_site.models import *
from api.v1.serializers import ArticleSerializer
from news_site.utils import create_index, ingest_to_elastic
from news_site.classify import RegexClassification


class DataList(list):
    def __init__(self, generator):
        self.generator = generator
        self._len = 1

    def __iter__(self):
        self._len = 0
        for item in self.generator:
            yield item
            self._len += 1

    def __len__(self):
        return self._len


class Command(BaseCommand):
    help = 'This command is used to generate newscout data in json format'


    def get_tags(self, tags):
        """
        this method will return tag name from tags objects
        """
        tag_list = []
        for tag in tags:
            tag_list.append(tag["name"])
        return tag_list

    def get_data(self):
        domain = Domain.objecs.get(doamin_id="newscout")
        articles = Article.objects.filter(domain=domain)
        count = 0
        for article_obj in articles.iterator():
            serializer = ArticleSerializer(article_obj)
            json_data = serializer.data
            count += 1
            print(count)
            if json_data["hash_tags"]:
                tag_list = self.get_tags(json_data["hash_tags"])
                json_data["hash_tags"] = tag_list
            yield json_data

    def handle(self, *args, **options):
        with open('newscout.json', 'w') as outfile:
            get_data_handle = self.get_data()
            data_list = DataList(get_data_handle)
            for c in json.JSONEncoder().iterencode(data_list):
                outfile.write(c)