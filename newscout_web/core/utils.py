import sys
import json
from hashlib import md5
from django.conf import settings
from elasticsearch import helpers
from elasticsearch import Elasticsearch


es = Elasticsearch(
    hosts=[
        {
            'host': settings.ELASTIC_SERVER_IP,
            'port': settings.ELASTIC_SERVER_PORT
        }
    ]
)

def create_index(index, mapping=None):
    """
    this function create new mapping
    """
    if not es.indices.exists(index):
        if mapping:
            es.indices.create(index=index, body=mapping)
        else:
            es.indices.create(index=index)
        print ("Created Index >>>>>>>>>>> " + index)
    else:
        print ("Index Already exsits >>>>>>>>>>> " + index)


def delete_existing_index(index):
    """
    this function will check if the index is present if so deletes it and
    creates new mapping
    """
    if es.indices.exists(index):
        es.indices.delete(index=index)
        print ("Deleted Index >>>>>>>>>>> " + index)
    es.indices.create(index=index)
    print ("Created Index >>>>>>>>>>> " + index)


def create_mapping_for_index(index, mapping):
    """
    this function will check if the index is present if so deletes it and
    creates new mapping
    """
    if es.indices.exists(index):
        es.indices.delete(index=index)
        print ("Deleted Index >>>>>>>>>>> " + index)
    es.indices.create(index=index, body=mapping)
    print ("Created Index >>>>>>>>>>> " + index)


def ingest_to_elastic(docs, index, item_type, item_id):
    actions = []

    for i, item in enumerate(docs):
        action = {
            "_index": index,
            "_id": md5(str(item[item_id]).encode()).hexdigest(),
            "_source": item
        }
        if item_type:
            action["_type"] = item_type

        actions.append(action)
    helpers.bulk(es, actions, chunk_size=100, request_timeout=20)


def update_to_elastic(docs, index, item_type, item_id):
    actions = []
    for i, item in enumerate(docs):
        action = {
            "_op_type": "update",
            "_index": index,
            "_type": item_type,
            "_id": md5(str(item[item_id]).encode()).hexdigest(),
            "doc": item
        }
        actions.append(action)
    helpers.bulk(es, actions, chunk_size=100, request_timeout=20)


def delete_from_elastic(docs, index, item_type, item_id):
    actions = []
    for i, item in enumerate(docs):
        action = {
            "_op_type": "delete",
            "_index": index,
            "_type": item_type,
            "_id": md5(str(item[item_id]).encode()).hexdigest(),
            "doc": item
        }
        actions.append(action)
    helpers.bulk(es, actions, index=index, refresh=True)
