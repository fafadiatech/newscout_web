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


class Command(BaseCommand):
    help = 'This command is used to ingest data from local disk cache'

    def __init__(self, *args, **kwargs):
        super(Command, self).__init__(*args, **kwargs)
        self.now = datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%Y-%m-%d")
        self.redis = redis.Redis()
        self.batch = []
        self.classify = RegexClassification()

    def add_arguments(self, parser):
        parser.add_argument('--json', '-j', type=str, help='json files path')
        parser.add_argument('--index', '-i', type=str, default='article', help='elastic search index name [default: article]')
        parser.add_argument('--domain_name', '-n', type=str, help='domain name')
        parser.add_argument('--domain_id', '-d', type=str, help='domain id')

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

    def create_model_obj(self, doc, index, domain):
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
                    category, _ = Category.objects.get_or_create(name=category)
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

                serializer = ArticleSerializer(article_obj)
                json_data = serializer.data
                if json_data["hash_tags"]:
                    tag_list = self.get_tags(json_data["hash_tags"])
                    json_data["hash_tags"] = tag_list
                self.batch.append(json_data)
                if len(self.batch) == 99:
                    ingest_to_elastic(self.batch, index, index, 'id')
                    self.batch = []
                    print("Ingesting Batch To Elastic...!!!")

    def handle(self, *args, **options):
        if options['source'] == None :
           raise CommandError("Option `--source=...` must be specified.")

        json_files = options['json']
        index = options['index']
        domain_name = options["domain_name"]
        domain_id = options["domain_id"]
        if not domain_name:
            raise CommandError("Option `--domain_name=...` must be specified.")

        if not domain_id:
            raise CommandError("Option `--domain_id=...` must be specified.")

        create_index(index)
        domain, _ = Domain.objects.get_or_create(domain_name=domain_name, domain_id=domain_id)
        try:
            for root, _, files in os.walk(json_files):
                if files:
                    for f in files:
                        if f.endswith(".dat"):
                            file_path = "{0}/{1}".format(root, f)
                            if os.path.isfile(file_path):
                                doc = cPickle.loads(zlib.decompress(open(file_path).read()))
                                try:
                                    self.create_model_obj(doc, index, domain)
                                except Exception as e:
                                    print(e)
                            else:
                                msg = "Data file not found: {0}".format(file_path)
                                print(msg)

            if self.batch:
                ingest_to_elastic(self.batch, index, index, 'id')
                print("Ingesting Final Batch...!!!")
                self.batch = []
        except KeyboardInterrupt:
            sys.exit(0)
