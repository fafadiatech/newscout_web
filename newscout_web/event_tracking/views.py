import os
import pymongo
from datetime import datetime, timedelta, time

from django.views import View
from django.conf import settings
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Event


class TrackerAPI(View):

    def get(self, request, format=None):
        events = Event()
        pixel_path = os.path.join(settings.STATICFILES_DIRS[0], 'images', "tracker.gif")
        pixel = open(pixel_path, "rb").read()

        fired_event = {}
        for k, v in request.GET.items():
            fired_event[k] = v

        events.add(fired_event)
        return HttpResponse(pixel, content_type="image/gif")


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
            if "category_name" in i and "domain" in i:
                value = i["category_name"]
                key = i["domain"]
                if key not in results:
                    results[key] = [value]
                else:
                    if value not in results[key]:
                        results[key].append(value)

        if not results:
            data = events.collection.find({'device_id': device_id}).sort([("ts", pymongo.DESCENDING)])
            for i in data:
                if "category_name" in i and "domain" in i:
                    value = i["category_name"]
                    key = i["domain"]
                    if key not in results:
                        results[key] = [value]
                    else:
                        results[key].append(value)
                    if len(results[key]) == 14:
                        break

        return Response(results)
