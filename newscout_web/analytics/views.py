import pytz
import calendar
from itertools import groupby
from operator import itemgetter
from datetime import datetime, time, timedelta

from django.views.generic.base import TemplateView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from api.v1.views import create_response
from api.v1.exception_handler import create_error_response
from event_tracking.models import Event

class IndexView(TemplateView):
    template_name = "analytics_index.html"

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        return context


class ParseDateRange():
    tz = pytz.timezone('Asia/Kolkata')

    def parse_datetime(self, date_range):
        first_date = date_range.split('-')[0].strip()
        first_date_obj = datetime.strptime(first_date, '%m/%d/%Y %H:%M:%S')
        first_date_obj = datetime.combine(first_date_obj, time.min)
        last_date = date_range.split('-')[-1].strip()
        last_date_obj = datetime.strptime(last_date, '%m/%d/%Y %H:%M:%S')
        last_date_obj = datetime.combine(last_date_obj, time.max)
        # first_aware = first_date_obj.replace(tzinfo=self.tz)
        # last_aware = last_date_obj.replace(tzinfo=self.tz)
        # first_date_obj = first_aware.astimezone(pytz.UTC)
        # last_date_obj = last_aware.astimezone(pytz.UTC)
        return first_date_obj, last_date_obj

    def get_default_date_range(self):
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=6)
        start_date = datetime.combine(start_date, time.min)
        end_date = datetime.combine(end_date, time.max)
        # start_aware = start_date.replace(tzinfo=self.tz)
        # end_aware = end_date.replace(tzinfo=self.tz)
        # start_date_obj = start_aware.astimezone(pytz.UTC)
        # end_date_obj = end_aware.astimezone(pytz.UTC)
        return start_date, end_date, ""

    def get_date_range(self, date_range):
        if date_range:
            if date_range == "today":
                date = datetime.now().date()
                start_date = datetime.combine(date, time.min)
                end_date = datetime.combine(date, time.max)
                return start_date, end_date, ""

            elif date_range == "yesterday":
                date = datetime.now().date() - timedelta(days=1)
                start_date = datetime.combine(date, time.min)
                end_date = datetime.combine(date, time.max)
                return start_date, end_date, ""

            elif date_range == "7days":
                return self.get_default_date_range()

            elif date_range == "30days":
                date = datetime.now().date() - timedelta(days=30)
                start_date = datetime.combine(date, time.min)
                end_date = datetime.combine(datetime.now().date(), time.max)
                return start_date, end_date, ""

            elif date_range == "last_month":
                date = datetime.now().date()
                y, m = calendar.prevmonth(date.year, date.month)
                start_date = datetime(y, m, 1)
                end_date = datetime(y, m, calendar.monthlen(y, m))
                end_date = datetime.combine(end_date, time.max)
                return start_date, end_date, ""

            else:
                try:
                    start_date, end_date = self.parse_datetime(date_range)
                    return start_date, end_date, ""
                except Exception as e:
                    return "", "", create_error_response(
                                        {"Msg": "Invalid date range"})
        else:
            start_date, end_date, error = self.get_default_date_range()
            return start_date, end_date, error


class AllArticlesOpen(APIView, ParseDateRange):

    permission_classes = (AllowAny,)
    events = Event()

    def get_avg(self, start_date, end_date, domain_id):
        pipeline = [{
            "$match": {"$and": [
            {"ts": {"$gte": start_date, "$lte": end_date}},
            {"domain_id": domain_id}]}},
            {"$match": {
                "$or": [{"action": "article_detail"},
                    {"action": "article_search_details"}]}},
            {"$project": {
                "_id": 0, "datePartDay": {
                    "$concat": [{"$substr": [
                        {"$dayOfMonth" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$month" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$year" : "$ts"}, 0, 4]}]},
                        "platform": "$platform"}},
            {"$group": {"_id": "$datePartDay", "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0, "dateStr": "$_id",
                "dateObj": {
                    "$dateFromString": {"dateString": "$_id"}},
                    "count": "$count"}},
            {"$group": {
                "_id":"count","avg_count": {"$avg":"$count"}}},
            {"$project": {
                "_id":0, "avg_count": {"$round": ["$avg_count", 1]}}}]
        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def get(self, request):
        date_range = request.GET.get("date_range")
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        if not request.user.domain:
            res = {
                "data": [{"dateStr": "0", "dateObj": "0", "count": 0}],
                "max": {"count": None, "dateStr": None},
                "dateStr": 0,
                "avg_count": 0
            }
            no_data = True
            avg = {"avg_count": 0}
            return Response(
                create_response({
                    "result": res,
                    "no_data": no_data,
                    "avg_count": avg["avg_count"]}))

        domain_id = request.user.domain.domain_id
        pipeline = [
        {"$match": {"$and": [
            {"ts": {"$gte": start_date, "$lte": end_date}},
            {"domain_id": domain_id}]}},
        {"$match": {"$or": [
            {"action": "article_detail"},
            {"action": "article_search_details"}
        ]}},
        {"$project": {"_id": 0, "datePartDay": {
            "$concat": [
                {"$substr": [
                    {"$dayOfMonth" : "$ts"}, 0, 2]}, "-",
                    {"$substr" : [{"$month" : "$ts"}, 0, 2]}, "-",
                    {"$substr" : [{"$year" : "$ts"}, 0, 4]}]},
            "platform": "$platform"}},
        {"$group": {"_id": "$datePartDay", "count": {"$sum": 1}}},
        {"$project": {
            "_id": 0, "dateStr": "$_id", "dateObj": {"$dateFromString": {"dateString": "$_id"}},
            "count": "$count"}},
        {"$sort": {"dateObj": 1}}]

        data = list(self.events.collection.aggregate(pipeline))
        if data:
            max_func = lambda x: x["count"]
            max_values = max(data, key=max_func)
            avg = self.get_avg(start_date, end_date, domain_id)
            res = {
                "data": data,
                "max": {"count": max_values["count"],
                "dateStr": max_values["dateStr"]}
                }
            no_data = False
        else:
            res = {
                "data": [{"dateStr": "0", "dateObj": "0", "count": 0}],
                "max": {"count": None, "dateStr": None},
                "dateStr": 0,
                "avg_count": 0
            }
            no_data = True
            avg = {"avg_count": 0}
        return Response(create_response(
            {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}))


class ArticlesPerPlatform(APIView, ParseDateRange):

    permission_classes = (AllowAny,)
    events = Event()

    def get_avg(self, start_date, end_date, domain_id):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match":
                {"$or": [
                    {"action": "article_detail"},
                    {"action": "article_search_details"}]}},
            {"$project":
                {"_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [ {"$dayOfMonth" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$month" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$year" : "$ts"}, 0, 4]}]},
                        "platform": "$platform"}},
            {"$group":
                {"_id":
                    {"datePartDay": "$datePartDay",
                    "platform": "$platform"}, "count": {"$sum": 1}}},
            {"$project":
                {"_id": 0,
                    "dateObj":
                        {"$dateFromString":
                            {"dateString": "$_id.datePartDay"}},
                            "count": "$count",
                            "platform": "$_id.platform",
                            "dateStr": "$_id.datePartDay"}},
            {"$group": {
                "_id":"$platform","avg_count": {"$avg":"$count"}}},
            {"$project": {
                "_id":0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def get(self, request):
        date_range = request.GET.get("date_range")
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        if not request.user.domain:
            res = {"dateStr": None, "web": 0, "android": 0, "ios": 0}
            no_data = True
            avg = {"avg_count": 0}
            return Response(
                create_response({
                    "result": res,
                    "no_data": no_data,
                    "avg_count": avg["avg_count"]}))

        domain_id = request.user.domain.domain_id

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match":
                {"$or": [
                    {"action": "article_detail"},
                    {"action": "article_search_details"}]}},
            {"$project":
                {"_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [ {"$dayOfMonth" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$month" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$year" : "$ts"}, 0, 4]}]},
                        "platform": "$platform"}},
            {"$group":
                {"_id":
                    {"datePartDay": "$datePartDay",
                    "platform": "$platform"}, "count": {"$sum": 1}}},
            {"$project":
                {"_id": 0,
                    "dateObj":
                        {"$dateFromString":
                            {"dateString": "$_id.datePartDay"}},
                            "count": "$count",
                            "platform": "$_id.platform",
                            "dateStr": "$_id.datePartDay"}},
            {"$sort": {"dateObj": 1}}]

        data = list(self.events.collection.aggregate(pipeline))
        if data:
            res = []
            for key, values in groupby(data, itemgetter("dateStr")):
                d = {"dateStr": key}
                for v in values:
                    d[v["platform"]] = v["count"]
                res.append(d)
            no_data = False
            avg = self.get_avg(start_date, end_date, domain_id)
        else:
            res = {"dateStr": None, "web": 0, "android": 0, "ios": 0}
            no_data = True
            avg = {"avg_count": 0}

        return Response(create_response({"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}))


class ArticlesPerCategory(APIView, ParseDateRange):

    permission_classes = (AllowAny,)
    events = Event()

    def get_avg(self, start_date, end_date, domain_id):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match":
                {"$or": [
                    {"action": "article_detail"},
                    {"action": "article_search_details"}]}},
            {"$group": {"_id":
                {"category_id": "$category_id",
                "category_name": "$category_name"},
                "count": {"$sum": 1}}},
            {"$group": {
                "_id":"$category_id","avg_count": {"$avg":"$count"}}},
            {"$project": {
                "_id":0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def get(self, request):

        date_range = request.GET.get("date_range")
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        if not request.user.domain:
            data = [{"category_id":0, "category_name": None, "count": 0}]
            no_data = True
            avg = {"avg_count": 0}
            return Response(
                create_response({
                    "result": data,
                    "no_data": no_data,
                    "avg_count": avg["avg_count"]}))

        domain_id = request.user.domain.domain_id

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match":
                {"$or": [
                    {"action": "article_detail"},
                    {"action": "article_search_details"}]}},
            {"$group": {"_id":
                {"category_id": "$category_id",
                "category_name": "$category_name"},
                "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0, "category_id": "$_id.category_id",
                "category_name": "$_id.category_name", "count": "$count"}}]

        data = list(self.events.collection.aggregate(pipeline))
        no_data = False
        if not data:
            data = [{"category_id":0, "category_name": None, "count": 0}]
            no_data = True
            avg = {"avg_count": 0}
        else:
            avg = self.get_avg(start_date, end_date, domain_id)
        return Response(create_response(
            {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}))


class InteractionsPerCategory(APIView, ParseDateRange):

    permission_classes = (AllowAny,)
    events = Event()

    def get_avg(self, start_date, end_date, domain_id):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$group": {"_id": {"category": "$category_id",
                "category_name": "$category_name", "action":"$action"},
                "count": {"$sum": 1}}},
            {"$group": {"_id": {"category": "$_id.category",
                "category_name": "$_id.category_name"},
                "total": {"$sum": "$count"} }},
            {"$group": {
                "_id":"$category", "avg_count": {"$avg":"$total"}}},
            {"$project": {
                "_id":0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def get(self, request):

        date_range = request.GET.get("date_range")
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        if not request.user.domain:
            data = [{"category_id": None,
                "category_name": None, "total_transactions": 0}]
            no_data = True
            avg = {"avg_count": 0}
            return Response(
                create_response({
                    "result": data,
                    "no_data": no_data,
                    "avg_count": avg["avg_count"]}))

        domain_id = request.user.domain.domain_id

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$group": {"_id": {"category": "$category_id",
                "category_name": "$category_name", "action":"$action"},
                "count": {"$sum": 1}}},
            {"$group": {"_id": {"category": "$_id.category",
                "category_name": "$_id.category_name"},
                "total": {"$sum": "$count"} }},
            {"$project": {"_id": 0, "category_id": "$_id.category",
                "category_name": "$_id.category_name",
                "total_interactions": "$total"}}]

        data = list(self.events.collection.aggregate(pipeline))
        no_data = False
        if not data:
            data = [{
                "category_id": None,
                "category_name": None,
                "total_transactions": 0}]
            no_data = True
            avg = {"avg_count": 0}
        else:
            avg = self.get_avg(start_date, end_date, domain_id)
        return Response(create_response(
            {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}))


class ArticlesPerAuthor(APIView, ParseDateRange):

    permission_classes = (AllowAny,)
    events = Event()

    def get_avg(self, start_date, end_date, domain_id):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$group": {"_id": "$author_name", "count": {"$sum": 1}}},
            {"$group": {
                "_id":"_id", "avg_count": {"$avg":"$count"}}},
            {"$project": {
                "_id":0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def get(self, request):

        date_range = request.GET.get("date_range")
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        if not request.user.domain:
            data = [{"name": None, "article_count": 0}]
            no_data = True
            avg = {"avg_count": 0}
            return Response(
                create_response({
                    "result": data,
                    "no_data": no_data,
                    "avg_count": avg["avg_count"]}))

        domain_id = request.user.domain.domain_id

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$group": {"_id": "$author_name", "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0, "name": "$_id", "article_count": "$count"}}
        ]

        data = list(self.events.collection.aggregate(pipeline))
        no_data = False
        if not data:
            data = [{"name": None, "article_count": 0}]
            no_data = True
            avg = {"avg_count": 0}
        else:
            avg = self.get_avg(start_date, end_date, domain_id)
        return Response(create_response(
            {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}))


class InteractionsPerAuthor(APIView, ParseDateRange):

    permission_classes = (AllowAny,)
    events = Event()

    def get_avg(self, start_date, end_date, domain_id):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$group": {"_id": {
                "action": "$action",
                "author_name":"$author_name"}, "count": {"$sum": 1}}},
            {"$group": {
                "_id":"_id", "avg_count": {"$avg":"$count"}}},
            {"$project": {
                "_id":0, "avg_count": {"$round": ["$avg_count", 1]}}}
        ]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def get(self, request):

        date_range = request.GET.get("date_range")
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        if not request.user.domain:
            res = [{
                "author": None,
                "article_details": 0,
                "article_search_details": 0}]
            no_data = True
            avg = {"avg_count": 0}
            return Response(
                create_response({
                    "result": res,
                    "no_data": no_data,
                    "avg_count": avg["avg_count"]}))

        domain_id = request.user.domain.domain_id

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$group": {"_id": {
                "action": "$action",
                "author_name":"$author_name"}, "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0, "author": "$_id.author_name",
                "action": "$_id.action", "count": "$count"}},
                {"$sort": {"author": 1}}
        ]

        data = list(self.events.collection.aggregate(pipeline))
        if data:
            res = []
            for key, values in groupby(data, itemgetter("author")):
                d = {"author": key}
                for v in values:
                    d[v["action"]] = v["count"]
                res.append(d)
            no_data = False
            avg = self.get_avg(start_date, end_date, domain_id)
        else:
            res = [{
                "author": None,
                "article_details": 0,
                "article_search_details": 0}]
            no_data = True
            avg = {"avg_count": 0}
        return Response(create_response(
            {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}))


class ArticlesPerSession(APIView, ParseDateRange):

    permission_classes = (AllowAny,)
    events = Event()

    def get_avg(self, start_date, end_date, domain_id):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match":{"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$project":{
                "_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [ {"$dayOfMonth" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$month" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$year" : "$ts"}, 0, 4]}]},"sid": "$sid"}},
            {"$group": {
                "_id": {
                    "datePartDay": "$datePartDay",
                    "sid": "$sid"},
                    "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0,
                "dateObj": {
                    "$dateFromString":{"dateString": "$_id.datePartDay"}},
                    "count": "$count",
                    "sid": "$_id.sid",
                    "dateStr": "$_id.datePartDay"}},
            {"$group": {
                "_id":"$dateStr",
                "avg_count": {"$avg":"$count"}}},
            {"$project": {
                "_id":0,
                "dateStr": "$_id",
                "avg_count": {"$round": ["$avg_count", 1]}}},
            {"$group": {
                "_id":"dateStr", "avg_count": {"$avg":"$avg_count"}}},
            {"$project": {
                "_id":0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def get(self, request):

        date_range = request.GET.get("date_range")
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        if not request.user.domain:
            res = {"data": [{"dateStr": None, "avg_count": 0}]}
            no_data = True
            avg = {"avg_count": 0}
            return Response(
                create_response({
                    "result": res,
                    "no_data": no_data,
                    "avg_count": avg["avg_count"]}))

        domain_id = request.user.domain.domain_id

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$match":{"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$project":{
                "_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [ {"$dayOfMonth" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$month" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$year" : "$ts"}, 0, 4]}]},"sid": "$sid"}},
            {"$group": {
                "_id": {
                    "datePartDay": "$datePartDay",
                    "sid": "$sid"},
                    "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0,
                "dateObj": {
                    "$dateFromString":{"dateString": "$_id.datePartDay"}},
                    "count": "$count",
                    "sid": "$_id.sid",
                    "dateStr": "$_id.datePartDay"}},
            {"$group": {
                "_id":"$dateStr",
                "avg_count": {"$avg":"$count"}}},
            {"$project": {
                "_id":0,
                "dateStr": "$_id",
                "avg_count": {"$round": ["$avg_count", 1]}}},
            {"$sort": {"dateStr": -1}}]

        data = list(self.events.collection.aggregate(pipeline))
        if data:
            res = {"data": data}
            no_data = False
            avg = self.get_avg(start_date, end_date, domain_id)
        else:
            res = {
                "data": [{"dateStr": None, "avg_count": 0}]
            }
            no_data = True
            avg = {"avg_count": 0}
        return Response(create_response(
            {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}))


class InteractionsPerSession(APIView, ParseDateRange):

    permission_classes = (AllowAny,)
    events = Event()

    def get_avg(self, start_date, end_date, domain_id):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$project":{
                "_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [ {"$dayOfMonth" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$month" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$year" : "$ts"}, 0, 4]}]},"sid": "$sid"}},
            {"$group": {
                "_id": {
                    "datePartDay": "$datePartDay",
                    "sid": "$sid"},
                    "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0,
                "dateObj": {
                    "$dateFromString":{"dateString": "$_id.datePartDay"}},
                    "count": "$count",
                    "sid": "$_id.sid",
                    "dateStr": "$_id.datePartDay"}},
            {"$group": {
                "_id":"$dateStr",
                "avg_count": {"$avg":"$count"}}},
            {"$project": {
                "_id":0,
                "dateStr": "$_id",
                "avg_count": {"$round": ["$avg_count", 1]}}},
            {"$group": {
                "_id":"dateStr", "avg_count": {"$avg":"$avg_count"}}},
            {"$project": {
                "_id":0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def get(self, request):

        date_range = request.GET.get("date_range")
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        if not request.user.domain:
            data = [{"dateStr": None, "avg_count": 0}]
            no_data = True
            avg = {"avg_count": 0}
            return Response(
                create_response({
                    "result": data,
                    "no_data": no_data,
                    "avg_count": avg["avg_count"]}))

        domain_id = request.user.domain.domain_id

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}},
                {"domain_id": domain_id}]}},
            {"$project":{
                "_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [ {"$dayOfMonth" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$month" : "$ts"}, 0, 2]}, "-",
                        {"$substr" : [{"$year" : "$ts"}, 0, 4]}]},"sid": "$sid"}},
            {"$group": {
                "_id": {
                    "datePartDay": "$datePartDay",
                    "sid": "$sid"},
                    "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0,
                "dateObj": {
                    "$dateFromString":{"dateString": "$_id.datePartDay"}},
                    "count": "$count",
                    "sid": "$_id.sid",
                    "dateStr": "$_id.datePartDay"}},
            {"$group": {
                "_id":"$dateStr",
                "avg_count": {"$avg":"$count"}}},
            {"$project": {
                "_id":0,
                "dateStr": "$_id",
                "avg_count": {"$round": ["$avg_count", 1]}}},
            {"$sort": {"dateStr": -1}}]

        data = list(self.events.collection.aggregate(pipeline))
        no_data = False
        if not data:
            data = [{"dateStr": None, "avg_count": 0}]
            no_data = True
            avg = {"avg_count": 0}
        else:
            avg = self.get_avg(start_date, end_date, domain_id)
        return Response(create_response(
            {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}))
