import os
import pymongo
from django.conf import settings
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta, time

from .models import Event


class TrackerAPI(APIView):
    def get(self, request, format=None):
        events = Event()
        pixel_path = os.path.join(settings.STATICFILES_DIRS[0], "tracker.gif")
        pixel = open(pixel_path, "rb").read()

        fired_event = {}
        for k,v in self.request.query_params.items():
            fired_event[k] = v

        events.add(fired_event)
        return HttpResponse(pixel, content_type="image/gif")

class ActivityLogAPI(APIView):
    def get(self, request, format=None):
        events = Event()
        case_id = self.request.query_params.get('case_id')
        action = self.request.query_params.get('action')

        results = {}

        if action == 'log':
            results = events.get_activity_log(case_id)
        else:
            results = events.get_activity_stats(case_id)
        return Response(results)


class NewsCoutLogAPI(APIView):
    """
    this apiview is used to get activity log of user for last 14 days
    """

    def get(self, request):
        device_id = request.query_params.get('device_id')

        if not device_id:
            return Response({"error": "Device id is required"}, status=400)

        end_date = datetime.now().date()
        end = datetime.combine(end_date, time.min)

        start_date = end_date - timedelta(days=14)
        start = datetime.combine(start_date, time.max)

        events = Event()

        data = events.collection.find({'device_id': device_id, 'ts': {'$gte': start, '$lte': end}})

        results = {}

        for i in data:
            if "item_id" in i and "item_name" in i:
                key = i["item_id"]
                value = i["item_name"]
                if key not in results:
                    results[key] = value

        if not results:
            data = events.collection.find({'device_id': device_id}).sort([("ts", pymongo.DESCENDING)])
            for i in data:
                if "item_id" in i and "item_name" in i:
                    key = i["item_id"]
                    value = i["item_name"]
                    if key not in results:
                        results[key] = value
                        if len(results) == 14:
                            break

        return Response(results)
