import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_ft_news_site.settings")
django.setup()
import sys
import zlib
import pytz
import time
import redis
import json
import cPickle
from random import randint
from datetime import datetime
from dateutil.parser import parse
from django.core.management.base import BaseCommand, CommandError
from news_site.models import *
from api.v1.serializers import ArticleSerializer
from news_site.utils import create_index, ingest_to_elastic
from news_site.classify import RegexClassification

from multiprocessing import Pool


classify = RegexClassification()

def parse_date(date_str):
    try:
        dt = parse(date_str)
        return dt.astimezone(tz=pytz.UTC)
    except Exception:
        try:
            ts = int(date_str)
            return datetime.utcfromtimestamp(ts)
        except Exception:
            return None

def remove_char(tag, ch):
    """
    this method removes given char from tag
    """
    new_tag = [tag]
    if ch in tag:
        return tag.split(ch)
    return new_tag

def remove_special_chars(tags):
    """
    this method is used to remove special chars from tags
    """
    new_tags = []
    for tag in tags:
        new_tags = new_tags + remove_char(tag, ";")

    clean_tags = []
    for tag in new_tags:
        clean_tags = clean_tags + remove_char(tag, " & ")

    final_tags = []
    for tag in clean_tags:
        final_tags = final_tags + remove_char(tag, " and ")

    final_tags = [tag.replace("&", " ").replace(",", "").replace(":", "").replace("'", "").replace("#", "").replace("*", "").replace("(", "").replace(")", "").replace("@", "").replace("!", "").replace("-", " ").strip().lower() for tag in final_tags]

    return final_tags

def get_tags(tags):
    """
    this method will return tag name from tags objects
    """
    tag_list = []
    for tag in tags:
        tag_list.append(tag["name"])
    return tag_list

def create_model_obj(doc):
    """
    this method is used to create django article model object
    """
    title = doc.get("title") or ""
    category = ""
    source = doc.get("source") or ""
    source_url = doc.get("url") or ""
    cover_image = doc.get("cover_image") or ""
    blurb = doc.get("blurb") or ""
    full_text = doc.get("short_description") or doc.get("full_text", "")
    published_on = parse_date(doc.get("published_on"))
    if not published_on:
        published_on = timezone.now()
    author = doc.get("author", "")
    author_twitter = doc.get("author_twitter", "")
    video_data = doc.get("video_data", "")
    images = doc.get("images") or []
    tags = doc.get("tags") or []
    if not cover_image:
        if video_data:
            cover_image = video_data[0].get("video_image", "")
    if title and full_text:
        if not Article.objects.filter(title=title).exists():
            if category == "":
                # apply regex based category only if article is uncategorised
                # get category id from regex classfication
                category_id = classify.match(title)
                category = Category.objects.get(id=category_id)
            else:
                category = Category.objects.get(id=123)
            source, _ = Source.objects.get_or_create(name=source)
            article_obj = Article.objects.create(
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
                new_tags = remove_special_chars(tags)

                if new_tags:
                    for tag in new_tags:
                        tag_obj = HashTag.objects.filter(name=tag)
                        if tag_obj:
                            tag_objs.append(tag_obj.first())
                        else:
                            tag_obj = HashTag.objects.create(name=tag)
                            tag_objs.append(tag_obj)
                    article_obj.hash_tags.add(*tag_objs)

def get_input():
    for root, subdirs, files in os.walk("/home/tensor/json_data"):
        for f in files:
            file_path = os.path.join(root, f)
            print("sending {0}".format(f))
            yield file_path

def process_files(_file):
    if os.path.isfile(_file):
        doc = json.loads(open(_file).read())
        try:
            create_model_obj(doc)
            print("processed {0}".format(_file))
        except Exception as e:
            print(e)
    else:
        msg = "Data file not found: {0}".format(_file)
        print(msg)

def handle():
    p = Pool(5)
    p.map(process_files, get_input())
