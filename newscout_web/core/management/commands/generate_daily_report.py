import os
import sys
import json
import base64
import smtplib
import calendar

from itertools import groupby
from operator import itemgetter
from django.conf import settings
from django.utils.timezone import now
from event_tracking.models import Event
from datetime import datetime, time, timedelta
from django.core.mail import EmailMultiAlternatives

from django.core.management.base import BaseCommand

from core.models import Article, Category

from rest_framework.response import Response
from api.v1.views import create_response
from api.v1.exception_handler import create_error_response

from analytics.views import ParseDateRange, AllArticlesOpen

EMAIL_FROM = settings.EMAIL_FROM
SMTP_SERVER = settings.EMAIL_HOST
SMTP_PORT = settings.EMAIL_PORT
SMTP_PASSWORD = settings.EMAIL_HOST_PASSWORD
MAILING_LIST = ['hardik@fafadiatech.com']

DATA_DIR = os.path.join(settings.BASE_DIR, "news_site", "static", "js", "react")
final_result = []

def send_mail(final_result, report_type):
    today = now()
    if report_type == "today":
        email_subject = 'NewScout Daily Report ' + today.strftime("%d, %b %Y")
    elif report_type == "7days":
        email_subject = 'NewScout Weekly Report ' + today.strftime("%d, %b %Y")
    else:
        email_subject = 'NewScout Monthly Report ' + today.strftime("%d, %b %Y")

    report_avg_table = """
        <table border=1>
            <thead>
                <tr>
                    <th>Report type</th>
                    <th>Avg. Count</th>
                </tr>
            </thead>
            <tbody>"""
    for i in final_result:
        report_avg_table = report_avg_table + """<tr>
                        <td>"""+i['report_name']+"""</td>
                        <td>"""+str(i['report_result']['avg_count'])+"""</td>
                    </tr>"""
    report_avg_table + """</tbody></table>"""

    email_body = """
            <html>
                <head>
                </head>
                <body>
                    """ + report_avg_table + """
                </body>
            </html>"""
    print(email_body)
    try:
        msg = EmailMultiAlternatives(email_subject, '', EMAIL_FROM, MAILING_LIST)
        ebody = email_body
        msg.attach_alternative(ebody, "text/html")
        msg.send(fail_silently=False)
    except:
        print("Unable to send the email. Error: ", sys.exc_info()[0])
        raise

class Command(BaseCommand):
    help = 'This command is used to generate daily report'
    events = Event()

    def parse_datetime(self, date_range):
        first_date = date_range.split('-')[0].strip()
        first_date_obj = datetime.strptime(first_date, '%m/%d/%Y %H:%M:%S')
        first_date_obj = datetime.combine(first_date_obj, time.min)
        last_date = date_range.split('-')[-1].strip()
        last_date_obj = datetime.strptime(last_date, '%m/%d/%Y %H:%M:%S')
        last_date_obj = datetime.combine(last_date_obj, time.max)
        return first_date_obj, last_date_obj

    def get_default_date_range(self):
        date = datetime.now().date() - timedelta(days=30)
        start_date = datetime.combine(date, time.min)
        end_date = datetime.combine(datetime.now().date(), time.max)
        return start_date, end_date, ""

    def get_date_range(self, date_range):
        if date_range:
            if date_range == "today":
                date = datetime.now().date()
                start_date = datetime.combine(date, time.min)
                end_date = datetime.combine(date, time.max)
                return start_date, end_date, ""

            # elif date_range == "yesterday":
            #     date = datetime.now().date() - timedelta(days=2)
            #     start_date = datetime.combine(date, time.min)
            #     end_date = datetime.combine(date, time.max)
            #     return start_date, end_date, ""

            elif date_range == "7days":
                end_date = datetime.now().date()
                start_date = end_date - timedelta(days=6)
                start_date = datetime.combine(start_date, time.min)
                end_date = datetime.combine(end_date, time.max)
                return start_date, end_date, ""

            elif date_range == "30days":
                return self.get_default_date_range()

            # elif date_range == "last_month":
            #     date = datetime.now().date()
            #     y, m = calendar.prevmonth(date.year, date.month)
            #     start_date = datetime(y, m, 1)
            #     end_date = datetime(y, m, calendar.monthlen(y, m))
            #     end_date = datetime.combine(end_date, time.max)
            #     return start_date, end_date, ""

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
    
    def all_articles_open_avg(self, start_date, end_date):
        pipeline = [{
            "$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match": {
                "$or": [{"action": "article_detail"},
                        {"action": "article_search_details"}]}},
            {"$project": {
                "_id": 0, "datePartDay": {
                    "$concat": [{"$substr": [
                        {"$dayOfMonth": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$month": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$year": "$ts"}, 0, 4]}]},
                "platform": "$platform"}},
            {"$group": {"_id": "$datePartDay", "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0, "dateStr": "$_id",
                "dateObj": {
                    "$dateFromString": {"dateString": "$_id"}},
                "count": "$count"}},
            {"$group": {
                "_id": "count", "avg_count": {"$avg": "$count"}}},
            {"$project": {
                "_id": 0, "avg_count": {"$round": ["$avg_count", 1]}}}]
        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def all_articles_open(self, date_range):
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}
            ]}},
            {"$project": {"_id": 0, "datePartDay": {
                "$concat": [
                    {"$substr": [
                        {"$dayOfMonth": "$ts"}, 0, 2]}, "-",
                    {"$substr": [{"$month": "$ts"}, 0, 2]}, "-",
                    {"$substr": [{"$year": "$ts"}, 0, 4]}]},
                "platform": "$platform"}},
            {"$group": {"_id": "$datePartDay", "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0, "dateStr": "$_id", "dateObj": {"$dateFromString": {"dateString": "$_id"}},
                "count": "$count"}},
            {"$sort": {"dateObj": 1}}]

        data = list(self.events.collection.aggregate(pipeline))
        if data:
            def max_func(x): return x["count"]
            max_values = max(data, key=max_func)
            avg = self.all_articles_open_avg(start_date, end_date)
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
        report_result = {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}
        report_name = "Average Articles Open"
        final_report = {"report_name": report_name, "report_result": report_result}
        final_result.append(final_report.copy())
        # return Response(create_response(
        #     {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}))
    
    def articles_per_platform_avg(self, start_date, end_date):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match":
                {"$or": [
                    {"action": "article_detail"},
                    {"action": "article_search_details"}]}},
            {"$project":
                {"_id": 0,
                 "datePartDay": {
                     "$concat": [
                         {"$substr": [{"$dayOfMonth": "$ts"}, 0, 2]}, "-",
                         {"$substr": [{"$month": "$ts"}, 0, 2]}, "-",
                         {"$substr": [{"$year": "$ts"}, 0, 4]}]},
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
                "_id": "$platform", "avg_count": {"$avg": "$count"}}},
            {"$project": {
                "_id": 0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def articles_per_platform(self, date_range):
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match":
                {"$or": [
                    {"action": "article_detail"},
                    {"action": "article_search_details"}]}},
            {"$project":
                {"_id": 0,
                 "datePartDay": {
                     "$concat": [
                         {"$substr": [{"$dayOfMonth": "$ts"}, 0, 2]}, "-",
                         {"$substr": [{"$month": "$ts"}, 0, 2]}, "-",
                         {"$substr": [{"$year": "$ts"}, 0, 4]}]},
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
            avg = self.articles_per_platform_avg(start_date, end_date)
        else:
            res = {"dateStr": None, "web": 0, "android": 0, "ios": 0}
            no_data = True
            avg = {"avg_count": 0}

        report_result = {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}
        report_name = "Average Articles Per Platform"
        final_report = {"report_name": report_name, "report_result": report_result}
        final_result.append(final_report.copy())
        # return Response(create_response({"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}))

    def articles_per_category_avg(self, start_date, end_date):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match":
                {"$or": [
                    {"action": "article_detail"},
                    {"action": "article_search_details"}]}},
            {"$group": {"_id":
                        {"category_id": "$category_id",
                         "category_name": "$category_name"},
                        "count": {"$sum": 1}}},
            {"$group": {
                "_id": "$category_id", "avg_count": {"$avg": "$count"}}},
            {"$project": {
                "_id": 0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def articles_per_category(self, date_range):
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
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
            data = [{"category_id": 0, "category_name": None, "count": 0}]
            no_data = True
            avg = {"avg_count": 0}
        else:
            avg = self.articles_per_category_avg(start_date, end_date)
        report_result = {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}
        report_name = "Average Articles Per Category"
        final_report = {"report_name": report_name, "report_result": report_result}
        final_result.append(final_report.copy())
        # return Response(create_response(
        #     {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}))
    
    def interactions_per_category_avg(self, start_date, end_date):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$group": {"_id": {"category": "$category_id",
                                "category_name": "$category_name", "action": "$action"},
                        "count": {"$sum": 1}}},
            {"$group": {"_id": {"category": "$_id.category",
                                "category_name": "$_id.category_name"},
                        "total": {"$sum": "$count"}}},
            {"$group": {
                "_id": "$category", "avg_count": {"$avg": "$total"}}},
            {"$project": {
                "_id": 0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def interactions_per_category(self, date_range):
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$group": {"_id": {"category": "$category_id",
                                "category_name": "$category_name", "action": "$action"},
                        "count": {"$sum": 1}}},
            {"$group": {"_id": {"category": "$_id.category",
                                "category_name": "$_id.category_name"},
                        "total": {"$sum": "$count"}}},
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
            avg = self.interactions_per_category_avg(start_date, end_date)
        report_result = {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}
        report_name = "Average Interactions Per Category"
        final_report = {"report_name": report_name, "report_result": report_result}
        final_result.append(final_report.copy())
        # return Response(create_response(
        #     {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}))
    
    def articles_per_author_avg(self, start_date, end_date):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$group": {"_id": "$author_name", "count": {"$sum": 1}}},
            {"$group": {
                "_id": "_id", "avg_count": {"$avg": "$count"}}},
            {"$project": {
                "_id": 0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def articles_per_author(self, date_range):
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
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
            avg = self.articles_per_author_avg(start_date, end_date)
        report_result = {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}
        report_name = "Average Articles Per Author"
        final_report = {"report_name": report_name, "report_result": report_result}
        final_result.append(final_report.copy())
        # return Response(create_response(
        #     {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}))

    def interactions_per_author_avg(self, start_date, end_date):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$group": {"_id": {
                "action": "$action",
                "author_name": "$author_name"}, "count": {"$sum": 1}}},
            {"$group": {
                "_id": "_id", "avg_count": {"$avg": "$count"}}},
            {"$project": {
                "_id": 0, "avg_count": {"$round": ["$avg_count", 1]}}}
        ]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def interactions_per_author(self, date_range):
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$group": {"_id": {
                "action": "$action",
                "author_name": "$author_name"}, "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0, "author": "$_id.author_name",
                "action": "$_id.action", "count": "$count"}},
            {"$sort": {"author": 1}}
        ]

        data = list(self.events.collection.aggregate(pipeline))
        if data:
            res = []
            try:
                for key, values in groupby(data, itemgetter("author")):
                    d = {"author": key}
                    for v in values:
                        d[v["action"]] = v["count"]
                    res.append(d)
                avg = self.interactions_per_author_avg(start_date, end_date)
            except:
                avg = {"avg_count": 0}
            no_data = False
        else:
            res = [{
                "author": None,
                "article_details": 0,
                "article_search_details": 0}]
            no_data = True
            avg = {"avg_count": 0}
        report_result = {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}
        report_name = "Average Interactions Per Author"
        final_report = {"report_name": report_name, "report_result": report_result}
        final_result.append(final_report.copy())
        # return Response(create_response(
        #     {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}))

    def articles_per_session_avg(self, start_date, end_date):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$project": {
                "_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [{"$dayOfMonth": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$month": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$year": "$ts"}, 0, 4]}]}, "sid": "$sid"}},
            {"$group": {
                "_id": {
                    "datePartDay": "$datePartDay",
                    "sid": "$sid"},
                "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0,
                "dateObj": {
                    "$dateFromString": {"dateString": "$_id.datePartDay"}},
                "count": "$count",
                "sid": "$_id.sid",
                "dateStr": "$_id.datePartDay"}},
            {"$group": {
                "_id": "$dateStr",
                "avg_count": {"$avg": "$count"}}},
            {"$project": {
                "_id": 0,
                "dateStr": "$_id",
                "avg_count": {"$round": ["$avg_count", 1]}}},
            {"$group": {
                "_id": "dateStr", "avg_count": {"$avg": "$avg_count"}}},
            {"$project": {
                "_id": 0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def articles_per_session(self, date_range):
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$match": {"$or": [
                {"action": "article_detail"},
                {"action": "article_search_details"}]}},
            {"$project": {
                "_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [{"$dayOfMonth": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$month": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$year": "$ts"}, 0, 4]}]}, "sid": "$sid"}},
            {"$group": {
                "_id": {
                    "datePartDay": "$datePartDay",
                    "sid": "$sid"},
                "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0,
                "dateObj": {
                    "$dateFromString": {"dateString": "$_id.datePartDay"}},
                "count": "$count",
                "sid": "$_id.sid",
                "dateStr": "$_id.datePartDay"}},
            {"$group": {
                "_id": "$dateStr",
                "avg_count": {"$avg": "$count"}}},
            {"$project": {
                "_id": 0,
                "dateStr": "$_id",
                "avg_count": {"$round": ["$avg_count", 1]}}},
            {"$sort": {"dateStr": -1}}]

        data = list(self.events.collection.aggregate(pipeline))
        if data:
            res = {"data": data}
            no_data = False
            avg = self.articles_per_session_avg(start_date, end_date)
        else:
            res = {
                "data": [{"dateStr": None, "avg_count": 0}]
            }
            no_data = True
            avg = {"avg_count": 0}
        report_result = {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}
        report_name = "Average Articles Per Session"
        final_report = {"report_name": report_name, "report_result": report_result}
        final_result.append(final_report.copy())
        # return Response(create_response(
        #     {"result": res, "no_data": no_data, "avg_count": avg["avg_count"]}))

    def interactions_per_session_avg(self, start_date, end_date):
        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$project": {
                "_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [{"$dayOfMonth": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$month": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$year": "$ts"}, 0, 4]}]}, "sid": "$sid"}},
            {"$group": {
                "_id": {
                    "datePartDay": "$datePartDay",
                    "sid": "$sid"},
                "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0,
                "dateObj": {
                    "$dateFromString": {"dateString": "$_id.datePartDay"}},
                "count": "$count",
                "sid": "$_id.sid",
                "dateStr": "$_id.datePartDay"}},
            {"$group": {
                "_id": "$dateStr",
                "avg_count": {"$avg": "$count"}}},
            {"$project": {
                "_id": 0,
                "dateStr": "$_id",
                "avg_count": {"$round": ["$avg_count", 1]}}},
            {"$group": {
                "_id": "dateStr", "avg_count": {"$avg": "$avg_count"}}},
            {"$project": {
                "_id": 0, "avg_count": {"$round": ["$avg_count", 1]}}}]

        data = list(self.events.collection.aggregate(pipeline))
        if not data:
            return {"avg_count": 0}
        return data[0]

    def interactions_per_session(self, date_range):
        start_date, end_date, error = self.get_date_range(date_range)
        if error:
            return Response(error, status=400)

        pipeline = [
            {"$match": {"$and": [
                {"ts": {"$gte": start_date, "$lte": end_date}}]}},
            {"$project": {
                "_id": 0,
                "datePartDay": {
                    "$concat": [
                        {"$substr": [{"$dayOfMonth": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$month": "$ts"}, 0, 2]}, "-",
                        {"$substr": [{"$year": "$ts"}, 0, 4]}]}, "sid": "$sid"}},
            {"$group": {
                "_id": {
                    "datePartDay": "$datePartDay",
                    "sid": "$sid"},
                "count": {"$sum": 1}}},
            {"$project": {
                "_id": 0,
                "dateObj": {
                    "$dateFromString": {"dateString": "$_id.datePartDay"}},
                "count": "$count",
                "sid": "$_id.sid",
                "dateStr": "$_id.datePartDay"}},
            {"$group": {
                "_id": "$dateStr",
                "avg_count": {"$avg": "$count"}}},
            {"$project": {
                "_id": 0,
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
            avg = self.interactions_per_session_avg(start_date, end_date)
        report_result = {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}
        report_name = "Average Interactions Per Session"
        final_report = {"report_name": report_name, "report_result": report_result}
        final_result.append(final_report.copy())
        # return Response(create_response(
        #     {"result": data, "no_data": no_data, "avg_count": avg["avg_count"]}))
    
    def get_report(self, report_type):
        self.all_articles_open(report_type)
        self.articles_per_platform(report_type)
        self.articles_per_category(report_type)
        self.interactions_per_category(report_type)
        self.articles_per_author(report_type)
        self.interactions_per_author(report_type)
        self.articles_per_session(report_type)
        self.interactions_per_session(report_type)
    
    def add_arguments(self, parser):
        parser.add_argument('report_type', type=str, help='Add report type today, weekly, monthly')

    def handle(self, *args, **kwargs):
        report_type = kwargs['report_type']
        contents = self.get_report(report_type)
        send_mail(final_result, report_type)