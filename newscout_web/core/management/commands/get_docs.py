import re
import sys
import json
from django.core.management.base import BaseCommand

from core.models import *
from api.v1.serializers import ArticleSerializer
from core.utils import es


class Command(BaseCommand):
    help = 'This command is used to ingest data from database to elastic search'

    batch = []

    def add_arguments(self, parser):
        parser.add_argument('--greaterthan', '-g', type=str, help='Date greater than, Date Format: yyyy-mm-dd', required=True)
        parser.add_argument('--lessthan', '-l', type=str, help='Date less than, Date Format: yyyy-mm-dd', required=True)
        parser.add_argument('--output', '-o', type=str, help='Output file name, Example: output.json', required=True)

    def validate_date(self, str):
        pattern = "\d{4}-\d{2}-\d{2}"
        match = re.search(pattern, str)
        if match:
            return match.group()
        return None

    def get_query(self, gt, lt, index, size):
        return es.search(
                index=index,
                body={
                        "query": {
                            "range" : {
                                "published_on" : {
                                    "gt": gt,
                                    "lt": lt,
                                    "format": "yyyy-MM-dd"
                                }
                            }
                        },
                        "size": size
                    })

    def handle(self, *args, **options):
        index = "article"
        output = options["output"]
        gt = self.validate_date(options["greaterthan"])
        lt = self.validate_date(options["lessthan"])

        if not gt:
            print("Invalid greater than date")
            sys.exit(1)

        if not lt:
            print("Invalid less than date")
            sys.exit(1)

        size = 10
        response = self.get_query(gt, lt, index, size)

        size = response["hits"]["total"]

        if size > 0:
            response = self.get_query(gt, lt, index, size)

            for i in response["hits"]["hits"]:
                self.batch.append(i["_source"])

        if len(self.batch) > 0:
            with open(output, "w") as out:
                json.dump(self.batch, out)
            print ("\nJson data downloaded.\n")
        else:
            print ("\nNo Data found for given date range.\n")
