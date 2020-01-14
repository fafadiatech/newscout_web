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

from core.models import *
from api.v1.serializers import ArticleSerializer
from core.utils import create_index, ingest_to_elastic
from core.classify import RegexClassification

from article_scoring import ArticleScore


# prometheus stats
from prometheus_client import start_http_server, Gauge, Enum


class Command(BaseCommand):
    help = 'This command is used to ingest data from local disk cache'

    def __init__(self, *args, **kwargs):
        super(Command, self).__init__(*args, **kwargs)
        self.source_ingest = Gauge("total_ingest_count", "Total number of articles ingested", ['source', 'category'])
        self.task_state = Enum("article_ingestion_state", "Article ingestion states", states=["running", "waiting"])
        self.now = datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%Y-%m-%d")
        self.redis = redis.Redis()
        self.batch = []
        self.sleep_time = 0
        self.classify = RegexClassification()
        self.score = ArticleScore()

    def reset_stats(self):
        """
        this method is used to reset stats to zero
        """
        print("Resetting Stats")
        for metric in self.source_ingest._metrics.keys():
            source, category = metric
            self.source_ingest(source=source, category=category).set(0)

    def add_arguments(self, parser):
        parser.add_argument('--source', '-s', type=str, help='redis source name [Ex: theverge]')
        parser.add_argument('--index', '-i', type=str, default='article', help='elastic search index name [default: article]')

    def get_data_from_redis(self, source):
        """
        this method returns data from redis
        """
        return self.redis.lpop(source)

    def parse_date(self, date_str):
        try:
            dt = parse(date_str)
            return dt.astimezone(tz=pytz.UTC)
        except Exception:
            try:
                ts = int(date_str)
                return datetime.utcfromtimestamp(ts)
            except Exception:
                return None

    def remove_char(self, tag, ch):
        """
        this method removes given char from tag
        """
        new_tag = [tag]
        if ch in tag:
            return tag.split(ch)
        return new_tag

    def remove_special_chars(self, tags):
        """
        this method is used to remove special chars from tags
        """
        new_tags = []
        for tag in tags:
            new_tags = new_tags + self.remove_char(tag, ";")

        clean_tags = []
        for tag in new_tags:
            clean_tags = clean_tags + self.remove_char(tag, " & ")

        final_tags = []
        for tag in clean_tags:
            final_tags = final_tags + self.remove_char(tag, " and ")

        final_tags = [tag.replace("&", " ").replace(",", "").replace(":", "").replace("'", "").replace("#", "").replace("*", "").replace("(", "").replace(")", "").replace("@", "").replace("!", "").replace("-", " ").strip().lower() for tag in final_tags]

        return final_tags

    def get_tags(self, tags):
        """
        this method will return tag name from tags objects
        """
        tag_list = []
        for tag in tags:
            tag_list.append(tag["name"])
        return tag_list

    def create_model_obj(self, doc, domain, index):
        """
        this method is used to create django article model object
        """
        title = doc["title"]
        category = doc["category"]
        source = doc["source"]
        source_url = doc["source_url"]
        cover_image = doc["cover_image"]
        blurb = doc["blurb"]
        full_text = doc.get("short_description") or doc.get("full_text", "")
        published_on = self.parse_date(doc["published_on"])
        if not published_on:
            published_on = timezone.now()
        author = doc.get("author", "")
        author_twitter = doc.get("author_twitter", "")
        video_data = doc.get("video_data", "")
        images = doc["images"]
        tags = doc["tags"]
        if not cover_image:
            if video_data:
                cover_image = video_data[0].get("video_image", "")
        if title and full_text:
            if not Article.objects.filter(title=title).exists():
                if category == "Uncategorised":
                    # apply regex based category only if article is uncategorised
                    # get category id from regex classfication
                    category_id = self.classify.match(title)
                    category = Category.objects.get(id=category_id)
                else:
                    category = Category.objects.get(name=category)
                source, _ = Source.objects.get_or_create(name=source)
                article_obj = Article.objects.create(
                    domain=domain,
                    title=title,
                    source=source,
                    category=category,
                    source_url=source_url,
                    cover_image=cover_image,
                    blurb=blurb,
                    full_text=full_text,
                    published_on=published_on,
                    active=True
                )

                if len(images) > 1:
                    for img in images:
                        _ = ArticleMedia.objects.create(
                            article=article_obj,
                            category="image",
                            url=img
                        )

                if len(video_data) > 0:
                    for video_dic in video_data:
                        _ = ArticleMedia.objects.create(
                            article=article_obj,
                            category="video",
                            url=video_dic.get("video_image", ""),
                            video_url=video_dic.get("video_url", "")
                        )

                if len(tags) > 0:
                    tag_objs = []
                    new_tags = self.remove_special_chars(tags)

                    if new_tags:
                        for tag in new_tags:
                            tag_obj = HashTag.objects.filter(name=tag)
                            if tag_obj:
                                tag_objs.append(tag_obj.first())
                            else:
                                tag_obj = HashTag.objects.create(name=tag)
                                tag_objs.append(tag_obj)
                        article_obj.hash_tags.add(*tag_objs)

                # calculate article score
                score = self.score.calculate_score(doc)

                serializer = ArticleSerializer(article_obj)
                json_data = serializer.data
                json_data["article_score"] = score
                if json_data["hash_tags"]:
                    tag_list = self.get_tags(json_data["hash_tags"])
                    json_data["hash_tags"] = tag_list
                self.batch.append(json_data)
                if len(self.batch) == 99:
                    ingest_to_elastic(self.batch, index, index, 'id')
                    self.batch = []
                    print("Ingesting Batch To Elastic...!!!")

    def handle(self, *args, **options):
        if options['source'] == None:
           raise CommandError("Option `--source=...` must be specified.")

        # start prometheus http server for metrics
        start_http_server(8686)

        source = options['source']
        index = options['index']
        create_index(index)
        domain = Domain.objects.get(domain_id="newscout")
        try:
            while True:
                file_path = self.get_data_from_redis(source)
                if file_path:
                    date = datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%Y-%m-%d")
                    self.task_state.state("running")
                    self.sleep_time = 0
                    if os.path.isfile(file_path):
                        doc = cPickle.loads(zlib.decompress(open(file_path).read()))
                        try:
                            self.create_model_obj(doc, domain, index)
                            if date == self.now:
                                self.source_ingest.labels(source=doc.get("source", "source"), category=doc.get("category", "category")).inc()
                            else:
                                self.now = datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%Y-%m-%d")
                                # self.reset_stats()
                                self.source_ingest.labels(source=doc.get("source", "source"), category=doc.get("category", "category")).inc()
                        except Exception as e:
                            print("error in doc read")
                            print(e)
                    else:
                        msg = "Data file not found: {0}".format(file_path)
                        print(msg)
                else:
                    self.task_state.state("waiting")
                    print("Sleeping...!!!")
                    time.sleep(10)
                    self.sleep_time += 10
                    if self.sleep_time >= 60:
                        if self.batch:
                            ingest_to_elastic(self.batch, index, index, 'id')
                            print("Ingesting Final Batch...!!!")
                            self.batch = []
                            self.sleep_time = 0
        except KeyboardInterrupt:
            sys.exit(0)
