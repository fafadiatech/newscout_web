# -*- coding: utf-8 -*-

from datetime import datetime, timedelta
from django.utils.timezone import now
from django.conf import settings


class MongoDBModel:
    def encode_object_id_to_string(self, rec):
        rec["_id"] = str(rec["_id"])
        return rec

    def add(self, rec):
        """
        avoid adding duplicates while adding
        """
        rec["ts"] = datetime.now()
        self.collection.insert_one(rec)

    def find(self, filter_criteria):
        return list(self.collection.find(filter_criteria))

    def list_all(self):
        return map(self.encode_object_id_to_string, list(self.collection.find()))

    def count(self):
        return self.collection.find().count()


class Event(MongoDBModel):
    def __init__(self):
        self.collection = settings.DB["events"]

    def filtered_events(self, start, end):
        return self.collection.find({"ts": {"$gte": start, "$lte": end}})


class ArticleMongo(MongoDBModel):
    def __init__(self):
        self.collection = settings.DB["article"]

    def find_article(self, article_id):
        return self.collection.find({"article_id": article_id})

    def sync_article(self, pad_id):
        return self.collection.find({"pad_id": pad_id})

    def update_article(self, pad_id, text_content):
        return self.collection.update_one(
            {"pad_id": pad_id}, 
            {"$set": 
                {"blurb": text_content}
            }
        )

    def insert_article(self, article_obj, pad_id):
        obj = article_obj

        if self.collection.find({"slug": obj.slug}).count() > 0:
            item = self.find_article(obj)
        else:
            item = self.collection.insert_one(
                {"article_id": obj.id, "blurb": obj.blurb, "slug": obj.slug, "pad_id":pad_id}
            )
        return item
