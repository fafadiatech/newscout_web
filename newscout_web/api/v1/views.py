# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.http import Http404

from core.models import (Category, Article, Source, BaseUserProfile,
                         BookmarkArticle, ArticleLike, HashTag, Menu, Notification, Devices,
                         SocialAccount, Category, CategoryAssociation,
                         TrendingArticle, Domain, DailyDigest, DraftMedia, Comment,
                         Subscription)

from rest_framework.authtoken.models import Token

from rest_framework.views import APIView

from .serializers import (CategorySerializer, ArticleSerializer, UserSerializer,
                          SourceSerializer, LoginUserSerializer, BaseUserProfileSerializer,
                          BookmarkArticleSerializer, ArticleLikeSerializer, HashTagSerializer,
                          MenuSerializer, NotificationSerializer, TrendingArticleSerializer,
                          ArticleCreateUpdateSerializer, DraftMediaSerializer, CommentSerializer,
                          CommentListSerializer, SubsMediaSerializer)

from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import filters
from newscout_web.constants import SOCIAL_AUTH_PROVIDERS
from django.db.models import Q
from rest_framework.exceptions import APIException
from collections import OrderedDict
from rest_framework import generics, viewsets
from rest_framework.pagination import CursorPagination
from rest_framework.generics import ListAPIView
from rest_framework.parsers import JSONParser
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from datetime import datetime, timedelta
from django.db.models import Count, Max, Min
import pytz
import uuid
from core.utils import es, ingest_to_elastic, delete_from_elastic
from elasticsearch_dsl import Search
import math
from rest_framework.utils.urls import replace_query_param
from google.auth.transport import requests as grequests
from google.oauth2 import id_token
import facebook
from .exception_handler import (create_error_response, TokenIDMissing, ProviderMissing,
                                SocialAuthTokenException)
import logging
import operator
from functools import reduce
import tweepy
import json
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url


log = logging.getLogger(__name__)


def create_response(response_data):
    """
    method used to create response data in given format
    """
    response = OrderedDict()
    response["header"] = {"status": "1"}
    response["body"] = response_data
    return response


def create_serializer_error_response(errors):
    """
    methos is used to create error response for serializer errors
    """
    error_list = []
    for k, v in errors.items():
        if isinstance(v, dict):
            _, v = v.popitem()
        d = {}
        d["field"] = k
        d["field_error"] = v[0]
        error_list.append(d)
    return OrderedDict({"header": {"status": "0"}, "errors": {
        "errorList": error_list}})


class SignUpAPIView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        user_serializer = UserSerializer(data=request.data)
        if user_serializer.is_valid():
            user_serializer.save()
            return Response(create_response({"Msg": "sign up successfully"}))
        else:
            return Response(
                create_serializer_error_response(user_serializer.errors),
                status=403)


class LoginFieldsRequired(APIException):
    """
    api exception for no user found
    """
    status_code = 401
    default_detail = ("username and password are required")
    default_code = "username_and_password"


class LoginAPIView(generics.GenericAPIView):
    serializer_class = LoginUserSerializer
    permission_classes = (AllowAny,)

    def post(self, request, format=None):
        serializer = LoginUserSerializer(data=request.data)
        if not serializer.is_valid():
            res_data = create_serializer_error_response(serializer.errors)
            return Response(res_data, status=403)

        user = BaseUserProfile.objects.filter(email=request.data["email"]).first()
        device_name = request.data.get("device_name")
        device_id = request.data.get("device_id")
        if device_id and device_name:
            device, _ = Devices.objects.get_or_create(user=user,
                                                      device_name=device_name,
                                                      device_id=device_id)
            notification_obj, _ = Notification.objects.get_or_create(device=device)
            notification = NotificationSerializer(notification_obj)

        user_serializer = BaseUserProfileSerializer(user)
        token, _ = Token.objects.get_or_create(user=user)

        data = user_serializer.data
        data["token"] = token.key
        if device_id and device_name:
            data["breaking_news"] = notification.data['breaking_news']
            data["daily_edition"] = notification.data['daily_edition']
            data["personalized"] = notification.data['personalized']

        response_data = create_response({"user": data})
        return Response(response_data)


class LogoutAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        request.user.auth_token.delete()
        return Response(create_response({"Msg": "User has been logged out"}))


class UserHashTagAPIView(APIView):
    """
    Save new tags and remove older tags based on user selection
    """
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser,)

    def post(self, request, format=None):
        user = self.request.user
        hash_tags = request.data["tags"]
        user_tags = HashTag.objects.filter(name__in=hash_tags)
        if user_tags:
            user.passion.clear()
            user.passion.add(*user_tags)
            return Response(create_response({"Msg": "Successfully saved tags"}))
        return Response(create_error_response({"Msg": "Invalid tags"}), status=400)


class CategoryListAPIView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, format=None, *args, **kwargs):
        """
        List all news category
        """
        categories = CategorySerializer(Category.objects.all(), many=True)
        return Response(create_response({"categories": categories.data}))

    def post(self, request, format=None):
        """
        Save new category to database
        """
        if request.user.is_authenticated:
            serializer = CategorySerializer(data=request.data, many=True)
            if serializer.is_valid():
                serializer.save()
                return Response(create_response(serializer.data))
            return Response(create_error_response(serializer.errors), status=400)
        raise Http404

    def put(self, request, format=None):
        """
        update category in database
        """
        if request.user.is_authenticated:
            _id = request.data.get("id")
            category = Category.objects.get(id=_id)
            serializer = CategorySerializer(category, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(create_response(serializer.data))
            return Response(create_error_response(serializer.errors), status=400)
        raise Http404


class SourceListAPIView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, format=None, *args, **kwargs):
        """
        List all the sources
        """
        source = SourceSerializer(Source.objects.all(), many=True)
        return Response(create_response({"results": source.data}))


class NoarticleFound(APIException):
    """
    api exception for no user found
    """
    status_code = 404
    default_detail = ("Article does not exist")
    default_code = "no_article_found"


class PostpageNumberPagination(CursorPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    ordering = '-created_at'


class ArticleListAPIView(ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = (AllowAny,)
    pagination_class = PostpageNumberPagination
    filter_backends = (filters.OrderingFilter,)
    ordering = ('-published_on',)

    def get_queryset(self):
        q = self.request.GET.get("q", "")
        tag = self.request.GET.getlist("tag", "")
        category = self.request.GET.getlist("category", "")
        source = self.request.GET.getlist("source", "")
        queryset = Article.objects.all()

        if self.request.user.domain:
            queryset = queryset.filter(domain=self.request.user.domain)
        else:
            queryset = Article.objects.none()

        if source:
            queryset = queryset.filter(source__name__in=source)

        if category:
            queryset = queryset.filter(category__name__in=category)

        if tag:
            queryset = queryset.filter(hash_tags__name__in=tag)

        if q:
            q_list = q.split(" ")
            condition_1 = reduce(operator.or_, [Q(title__icontains=s) for s in q_list])
            condition_2 = reduce(operator.or_, [Q(full_text__icontains=s) for s in q_list])
            queryset = queryset.filter(condition_1 | condition_2)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            if serializer.data:
                paginated_response = self.get_paginated_response(serializer.data)
                return Response(create_response(paginated_response.data))
            else:
                return Response(create_error_response({"Msg": "News Doesn't Exist"}), status=400)


class ArticleDetailAPIView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, format=None, *args, **kwargs):
        slug = self.kwargs.get("slug", "")

        user = self.request.user
        article = Article.objects.filter(slug=slug).first()
        has_subscribed = False
        if not self.request.user.is_anonymous and \
            Subscription.objects.filter(
                user=self.request.user).exlcude(subs_type='Basic').exists():
            has_subscribed = True

        try:
            next_article = Article.objects.filter(id__gt=article.id).order_by("id")[0:1].get().slug
        except Exception as error:
            print(error)
            next_article = Article.objects.aggregate(Min("id"))['id__min']

        try:
            prev_article = Article.objects.filter(id__gt=article.id).order_by("-id")[0:1].get().slug
        except Exception as error:
            print(error)
            prev_article = Article.objects.aggregate(Max("id"))['id__max']

        if article:
            response_data = ArticleSerializer(article, context={
                "hash_tags_list": True, 'has_subscribed': has_subscribed}).data
            if not user.is_anonymous:
                book_mark_article = BookmarkArticle.objects.filter(
                    user=user, article=article).first()
                like_article = ArticleLike.objects.filter(
                    user=user, article=article).first()

                if book_mark_article:
                    response_data["isBookMark"] = True
                else:
                    response_data["isBookMark"] = False

                if like_article:
                    response_data["isLike"] = like_article.is_like
                else:
                    response_data["isLike"] = 2

            return Response(create_response({
                "article": response_data, "next_article": next_article, "prev_article": prev_article}))
        raise NoarticleFound

    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            article_id = self.request.POST.get("article_id", "")
            is_like = self.request.POST.get("isLike", "")
            user = self.request.user
            article = Article.objects.filter(id=article_id).first()
            if article:
                if is_like and int(is_like) <= 2:
                    article_like, created = ArticleLike.objects.get_or_create(
                        user=user, article=article)
                    article_like.is_like = is_like
                    article_like.save()
                    serializer = ArticleLikeSerializer(article_like)
                    return Response(create_response({
                        "Msg": "Article like status changed", "article": serializer.data
                    }))
                else:
                    return Response(create_error_response({
                        "Msg": "Invalid Input"
                    }))
            else:
                return Response(create_error_response({"Msg": "News doesn't exist"}), status=400)
        raise Http404


class ArticleBookMarkAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if request.data:
            article_id = request.data["article_id"]
        else:
            article_id = self.request.POST.get("article_id", "")
        user = self.request.user
        if article_id:
            article = Article.objects.filter(id=article_id).first()
            if article:
                bookmark_article, created = \
                    BookmarkArticle.objects.get_or_create(user=user,
                                                          article=article)
                if not created:
                    del_bookmark_article = BookmarkArticleSerializer(bookmark_article)
                    del_bookmark = del_bookmark_article.data
                    del_bookmark["status"] = 0
                    bookmark_article.delete()
                    return Response(create_response({
                        "Msg": "Article removed from bookmark list", "bookmark_article": del_bookmark
                    }))
                else:
                    bookmark_article = BookmarkArticleSerializer(bookmark_article)
                    return Response(create_response({
                        "Msg": "Article bookmarked successfully", "bookmark_article": bookmark_article.data
                    }))

        raise NoarticleFound


class ArticleRecommendationsAPIView(APIView):
    permission_classes = (AllowAny,)

    def format_response(self, response):
        results = []
        if response['hits']['hits']:
            for result in response['hits']['hits']:
                results.append(result["_source"])
        return results

    def get(self, request, *args, **kwargs):
        article_id = self.kwargs.get("article_id", "")
        if article_id:
            results = es.search(index='recommendation', body={"query": {"match": {"id": int(article_id)}}})
            if results['hits']['hits']:
                recommendation = results['hits']['hits'][0]['_source']['recommendation']
                search_results = es.search(index='article', body={
                                           "query": {"terms": {"id": recommendation}}, "size": 25})
                return Response(create_response({
                    "results": self.format_response(search_results)
                }))

        return Response(create_error_response({
            "Msg": "Error generating recommendation"
        }))


class ForgotPasswordAPIView(APIView):
    permission_classes = (AllowAny,)

    def genrate_password(self, password_length=10):
        """
        Returns a random pasword of length password_length.
        """
        random = str(uuid.uuid4())
        random = random.upper()
        random = random.replace("-", "")
        return random[0:password_length]

    def send_mail_to_user(self, email, password, first_name="", last_name=""):
        username = first_name + " " + last_name
        email_subject = 'NewsPost: Forgot Password Request'
        email_body = """
            <html>
                <head>
                </head>
                <body>
                    <p>
                        Hello """ + username + """,<br><br><b>
                        """ + password + """</b> is your new password
                        <br>
                        <br>
                        Thanks,<br>
                        The NewsPost Team<br>
                    </p>
                </body>
            </html>"""

        msg = EmailMultiAlternatives(
            email_subject, '', settings.EMAIL_FROM, [email])
        ebody = email_body
        msg.attach_alternative(ebody, "text/html")
        msg.send(fail_silently=False)

    def post(self, request, *args, **kwargs):
        email = request.data["email"]
        if email:
            user = BaseUserProfile.objects.filter(email=email)
            if user:
                user = user.first()
                password = self.genrate_password()
                self.send_mail_to_user(
                    email, password, user.first_name, user.last_name)
                user.set_password(password)
                user.save()
                return Response(create_response({
                    "Msg": "New password sent to your email"
                }))

        return Response(create_error_response({
            "Msg": "Email Does Not Exist"
        }))


class ChangePasswordAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if request.data:
            password = request.data["password"]
            old_password = request.data["old_password"]
            confirm_password = request.data["confirm_password"]
        else:
            password = self.request.POST.get("password", "")
            old_password = self.request.POST.get("old_password", "")
            confirm_password = self.request.POST.get("confirm_password", "")

        user = self.request.user
        if old_password:
            if not user.check_password(old_password):
                msg = "Old Password Does Not Match With User"
                return Response(create_error_response({
                    "Msg": msg, "field": "old_password"
                }))
            if confirm_password != password:
                msg = "Password and Confirm Password does not match"
                return Response(create_error_response({
                    "Msg": msg, "field": "confirm_password"
                }))
            if old_password == password:
                msg = "New password should not same as Old password"
                return Response(create_error_response({
                    "Msg": msg, "field": "password"
                }))
            if user and password:
                user.set_password(password)
                user.save()
                return Response(create_response({
                    "Msg": "Password changed successfully", "field": "confirm_password"
                }))
            else:
                return Response(create_error_response({
                    "Msg": "Password field is required", "field": "password"
                }))
        else:
            return Response(create_error_response({
                "Msg": "Old Password field is required", "field": "old_password"
            }))


class BookmarkArticleAPIView(APIView):
    """
    This class is used to get user bookmark list
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = self.request.user
        bookmark_list = BookmarkArticleSerializer(BookmarkArticle.objects.filter(user=user), many=True)
        return Response(create_response({"results": bookmark_list.data}))


class ArticleLikeAPIView(APIView):
    """
    This class is used to get user articles
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        like_list = [0, 1]
        user = self.request.user
        article_list = ArticleLikeSerializer(ArticleLike.objects.filter(user=user, is_like__in=like_list), many=True)
        return Response(create_response({"results": article_list.data}))


class HashTagAPIView(ListAPIView):
    serializer_class = HashTagSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        weekly = self.request.GET.get("weekly", "")
        monthly = self.request.GET.get("monthly", "")
        end = datetime.utcnow()
        pst = pytz.timezone('Asia/Kolkata')
        end = pst.localize(end)
        utc = pytz.UTC
        end = end.astimezone(utc)
        articles = Article.objects.all()
        queryset = HashTag.objects.all()

        if weekly:
            weekly = int(weekly)
            start = end - timedelta(days=7 * weekly)
            hash_tags = articles.filter(published_on__range=(start, end)).values(
                'hash_tags__name').annotate(count=Count('hash_tags')).order_by('-count')[:10]
            for hashtag in hash_tags:
                hashtag['name'] = hashtag.pop('hash_tags__name')
            queryset = hash_tags

        if monthly:
            monthly = int(monthly)
            start = end - timedelta(days=30 * monthly)
            hash_tags = articles.filter(published_on__range=(start, end)).values(
                'hash_tags__name').annotate(count=Count('hash_tags')).order_by('-count')[:10]
            for hashtag in hash_tags:
                hashtag['name'] = hashtag.pop('hash_tags__name')
            queryset = hash_tags

        if not weekly and not monthly:
            start = end - timedelta(days=1)
            hash_tags = articles.filter(published_on__range=(start, end)).values(
                'hash_tags__name').annotate(count=Count('hash_tags')).order_by('-count')[:10]
            for hashtag in hash_tags:
                hashtag['name'] = hashtag.pop('hash_tags__name')
            queryset = hash_tags

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            if serializer.data:
                paginated_response = self.get_paginated_response(serializer.data)
                return Response(create_response(paginated_response.data))
            else:
                return Response(create_error_response({"Msg": "No trending tags"}), status=400)

        serializer = self.get_serializer(queryset, many=True)
        return Response(create_response(serializer.data))


class ArticleSearchAPI(APIView):
    """
    this view is used for article search and filter
    """
    permission_classes = (AllowAny,)

    def format_response(self, response):
        results = []
        filters = {}
        if response.hits.hits:
            for result in response.hits.hits:
                source = result["_source"]
                if 'highlight' in result:
                    if 'title' in result['highlight']:
                        source['title'] = " ".join(result['highlight']['title'])
                    if 'blurb' in result['highlight']:
                        source['blurb'] = " ".join(result['highlight']['blurb'])
                results.append(source)

            if response.aggregations.category.buckets:
                filters["category"] = sorted(
                    response.aggregations.category.buckets._l_,
                    key=operator.itemgetter("key"))

            if response.aggregations.source.buckets:
                filters["source"] = sorted(
                    response.aggregations.source.buckets._l_,
                    key=operator.itemgetter("key"))

            if response.aggregations.hash_tags.buckets:
                filters["hash_tags"] = sorted(
                    response.aggregations.hash_tags.buckets._l_,
                    key=operator.itemgetter("key"))
        return results, filters

    def get(self, request):
        page = self.request.GET.get("page", "1")

        if page.isdigit():
            page = int(page)
        else:
            page = 1

        size = self.request.GET.get("rows", "20")
        if size.isdigit():
            size = int(size)
        else:
            size = 20

        query = self.request.GET.get("q", "")
        source = self.request.GET.getlist("source", [])
        category = self.request.GET.getlist("category", [])
        domain = self.request.GET.getlist("domain", [])
        tags = self.request.GET.getlist("tag", [])
        sort = self.request.GET.get("sort", "desc")

        if not domain:
            return Response(create_serializer_error_response({"domain": ["Domain id is required"]}))

        # mort like this for related queries
        mlt_fields = ["has_tags"]
        if source:
            mlt_fields = ["has_tags", "source", "domain"]
        mlt = Search(using=es, index="article").query("more_like_this", fields=mlt_fields,
                                                      like=query, min_term_freq=1, max_query_terms=12).source(mlt_fields)
        mlt.execute()
        sr = Search(using=es, index="article")

        # highlight title and blurb containing query
        sr = sr.highlight("title", "blurb", fragment_size=20000)

        # generate elastic search query
        must_query = [{"wildcard": {"cover_image": "*"}}]
        should_query = []

        if query:
            query = query.lower()
            must_query.append({"multi_match": {"query": query,
                                               "fields": ["title", "blurb"], 'type': 'phrase'}})

        if tags:
            tags = [tag.lower().replace("-", " ") for tag in tags]
            for tag in tags:
                sq = {"match_phrase": {"hash_tags": tag}}
                should_query.append(sq)

        if must_query:
            sr = sr.query("bool", must=must_query)

        if should_query:
            if len(should_query) > 1:
                sr = sr.filter("bool", should=should_query)
            else:
                sr = sr.filter("bool", should=should_query[0])

        if domain:
            sr = sr.filter("terms", domain=list(domain))

        if category:
            cat_objs = Category.objects.filter(name__in=category)
            category = cat_objs.values_list("id", flat=True)
            cat_assn_objs = CategoryAssociation.objects.filter(
                parent_cat__in=cat_objs).values_list(
                "child_cat__id", flat=True)
            if cat_assn_objs:
                new_category = set(list(cat_assn_objs) + list(category))
                sr = sr.filter("terms", category_id=list(new_category))
            else:
                if category:
                    sr = sr.filter("terms", category_id=list(category))

        if source:
            source = [s.lower() for s in source]
            sr = sr.filter("terms", source__keyword=source)

        sr = sr.sort({"article_score": {"order": sort}})
        sr = sr.sort({"published_on": {"order": sort}})

        # pagination
        start = (page - 1) * size
        end = start + size
        sr = sr[start:end]

        # generate facets
        sr.aggs.bucket("category", "terms", field="category.keyword")
        sr.aggs.bucket("source", "terms", field="source.keyword")
        sr.aggs.bucket("hash_tags", "terms", field="hash_tags.keyword", size=50)

        # execute query
        response = sr.execute()
        results, filters = self.format_response(response)
        count = response["hits"]["total"]
        total_pages = math.ceil(count / size)

        url = request.build_absolute_uri()
        if end < count:
            next_page = page + 1
            next_url = replace_query_param(url, "page", next_page)
        else:
            next_url = None

        if page != 1:
            previous_page = page - 1
            previous_url = replace_query_param(url, "page", previous_page)
        else:
            previous_url = None

        data = {
            "results": results,
            "filters": filters,
            "count": count,
            "total_pages": total_pages,
            "current_page": page,
            "next": next_url,
            "previous": previous_url
        }

        return Response(create_response(data))


class MenuAPIView(APIView):
    """
    This Api will return all the menus
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        domain_id = self.request.GET.get("domain")
        if not domain_id:
            return Response(create_error_response({"domain": ["Domain id is required"]}))

        domain = Domain.objects.filter(domain_id=domain_id).first()
        if not domain:
            return Response(create_error_response({"domain": ["Domain id is required"]}))

        menus = MenuSerializer(Menu.objects.filter(domain=domain), many=True)
        menus_list = menus.data
        new_menulist = []
        for menu in menus_list:
            menu_dict = {}
            menu_dict['heading'] = menu
            new_menulist.append(menu_dict)

        return Response(create_response({'results': new_menulist}))


class DevicesAPIView(APIView):
    """
    this api will add device_id and device_name
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        user = self.request.user
        device_id = self.request.POST.get("device_id", "")
        device_name = self.request.POST.get("device_name", "")
        if not user.is_anonymous and device_id and device_name:
            user_device = Devices.objects.filter(user=user.pk)
            if user_device:
                user_device.update(device_id=device_id, device_name=device_name, user=user.id)
                return Response(create_response({"Msg": "Device successfully created"}))
            elif not user_device:
                get, created = Devices.objects.get_or_create(device_id=device_id, device_name=device_name, user=user.id)
                if created:
                    return Response(create_response({"Msg": "Device successfully created"}))
                else:
                    return Response(create_response({"Msg": "Device already exist"}))
        elif device_id and device_name:
            get, created = Devices.objects.get_or_create(device_id=device_id, device_name=device_name)
            if created:
                return Response(create_response({"Msg": "Device successfully created"}))
            else:
                return Response(create_response({"Msg": "Device already exist"}))
        else:
            return Response(create_error_response({"Msg": "device_id and device_name field are required"}))


class NotificationAPIView(APIView):
    """
    this api will add notification data
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        device_id = request.data["device_id"]
        device_name = request.data["device_name"]
        breaking_news = request.data["breaking_news"]
        daily_edition = request.data["daily_edition"]
        personalized = request.data["personalized"]

        device = Devices.objects.get(device_id=device_id, device_name=device_name)
        if breaking_news and daily_edition and personalized and device:
            notification = Notification.objects.filter(device=device)
            if notification:
                notification.update(breaking_news=breaking_news, daily_edition=daily_edition, personalized=personalized)
                return Response(create_response({"Msg": "Notification updated successfully"}))
            Notification.objects.create(breaking_news=breaking_news, daily_edition=daily_edition,
                                        personalized=personalized, device=device)
            return Response(create_response({"Msg": "Notification created successfully"}))
        else:
            return Response(
                create_error_response(
                    {"Msg": "device_id, device_name, breaking_news, daily_edition and personalized are required"}))

    def get(self, request):
        device_id = request.GET.get("device_id")
        device_name = request.GET.get("device_name")
        device = Devices.objects.filter(device_id=device_id, device_name=device_name).first()
        if device:
            notification = NotificationSerializer(Notification.objects.fitler(device=device), many=True)
            return Response(create_response(notification.data))
        return Response(create_error_response({"Msg": "Invalid device_id or device_name"}))


class SocialLoginView(generics.GenericAPIView):
    """
    this view is used for google social authentication and login
    """
    permission_classes = (AllowAny,)
    serializer_class = BaseUserProfileSerializer

    def decode_google_token(self, token_id):
        """
        this method is used to decode and verify google token
        """
        request = grequests.Request()
        try:
            id_info = id_token.verify_oauth2_token(token_id, request)
            return id_info
        except Exception as e:
            log.debug("error in google token verification {0}".format(e))
            return False

    def get_name_details(self, id_info):
        """
        this methos is used to get first name and last name from id_info
        details
        """
        first_name = last_name = ""
        if "name" in id_info:
            name = id_info.get("name")
            name_list = name.split(" ")
            first_name = name_list[0]
            if len(name_list) > 1:
                last_name = " ".join(name_list[1:])

        if not first_name:
            if "given_name" in id_info:
                first_name = id_info.get("given_name")

        if not last_name:
            if "family_name" in id_info:
                last_name = id_info.get("family_name")

        return first_name, last_name

    def create_user_profile(self, first_name, last_name, username, email, image_url, sid, provider):
        """
        this method is used to create base user profile object for given
        social account
        """
        user = BaseUserProfile.objects.filter(email=email).first()
        created = ""
        if not user:
            user = BaseUserProfile.objects.create(
                first_name=first_name,
                last_name=last_name,
                email=email,
                username=username
            )
            sa_obj, created = SocialAccount.objects.get_or_create(
                social_account_id=sid,
                image_url=image_url,
                user=user,
                provider=provider
            )
            # create_profile_image.delay(sa_obj.id)
        return user, created

    def get_facebook_data(self, token_id):
        """
        this method is used to get facebook user data from given access token
        """
        graph = facebook.GraphAPI(access_token=token_id)
        try:
            res_data = graph.get_object(
                id='me?fields=email,id,first_name,last_name,name,picture.width(150).height(150)')
            return res_data
        except Exception as e:
            log.debug("error in facebook fetch data: {0}".format(e))
            return False

    def get_facebook_name_details(self, profile_data):
        """
        this method is used to get facebook first_name last_name from profile
        data
        """
        name = first_name = last_name = ""
        if "first_name" in profile_data:
            first_name = profile_data.get("first_name")

        if "last_name" in profile_data:
            last_name = profile_data.get("last_name")

        if "name" in profile_data:
            name = profile_data.get("name")
            name_list = name.split(" ")
            if not first_name:
                first_name = name_list[0]

            if not last_name:
                last_name = " ".join(name[1:])

        return first_name, last_name

    def get_user_serialize_data(self, email, device_id, device_name):
        """
        this method will return customize user data
        """
        user = BaseUserProfile.objects.filter(email=email).first()
        device = Devices.objects.filter(user=user.id)
        if device:
            device.update(device_name=device_name, device_id=device_id)
        else:
            device, created = Devices.objects.get_or_create(device_name=device_name, device_id=device_id)
            Devices.objects.filter(pk=device.pk).update(user=user)
        notification = NotificationSerializer(Notification.objects.get_or_create(device=device), many=True)
        token, _ = Token.objects.get_or_create(user=user)
        data = BaseUserProfileSerializer(user).data
        data["token"] = token.key
        data["breaking_news"] = notification.data[0]['breaking_news']
        data["daily_edition"] = notification.data[0]['daily_edition']
        data["personalized"] = notification.data[0]['personalized']
        return data

    def post(self, request, *args, **kwargs):
        """
        this is post method for collection google social auth data
        and generate authentication api token for user
        """
        token_id = request.data.get("token_id")
        provider = request.data.get("provider")
        device_id = request.data.get("device_id")
        device_name = request.data.get("device_name")

        if not token_id:
            raise TokenIDMissing()

        if not provider:
            raise ProviderMissing()

        if not device_id:
            return Response(create_error_response({"Msg": "device_id is missing or Invalid device_id"}))

        if not device_name:
            return Response(create_error_response({"Msg": "device_name is missing or Invalid device_name"}))

        if provider not in SOCIAL_AUTH_PROVIDERS:
            raise ProviderMissing()

        if provider == "google":
            id_info = self.decode_google_token(token_id)
            if not id_info:
                raise SocialAuthTokenException()

            first_name, last_name = self.get_name_details(id_info)

            email = id_info.get("email", "")
            if not email:
                raise SocialAuthTokenException()

            username = email.split("@")[0]

            google_id = id_info.get("sub", "")
            image_url = id_info.get("picture", "")

            user, created = self.create_user_profile(
                first_name, last_name, username, email, image_url, google_id, provider)

            user_data = self.get_user_serialize_data(email, device_id, device_name)

            return Response(create_response({"user": user_data}))

        if provider == "facebook":
            profile_data = self.get_facebook_data(token_id)
            if not profile_data:
                raise SocialAuthTokenException()

            first_name, last_name = self.get_facebook_name_details(
                profile_data)

            email = profile_data.get("email")
            if not email:
                raise SocialAuthTokenException()

            username = username = email.split("@")[0]
            facebook_id = profile_data.get("id", "")
            image_url = ""
            if "picture" in profile_data:
                if "data" in profile_data["picture"]:
                    image_url = profile_data["picture"]["data"]["url"]

            user, created = self.create_user_profile(
                first_name, last_name, username, email, image_url, facebook_id, provider)

            user_data = self.get_user_serialize_data(email, device_id, device_name)

            return Response(create_response({"user": user_data}))

        raise ProviderMissing()


class TrendingArticleAPIView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, format=None, *args, **kwargs):
        """
        List all the trending articles
        """
        domain_id = self.request.GET.get("domain")
        if not domain_id:
            return Response(create_error_response({"domain": ["Domain id is required"]}))

        domain = Domain.objects.filter(domain_id=domain_id).first()
        if not domain:
            return Response(create_error_response({"domain": ["Invalid domain name"]}))

        source = TrendingArticleSerializer(TrendingArticle.objects.filter(domain=domain), many=True)
        return Response(create_response({"results": source.data}))


class SocailMediaPublishing():
    """
    this class is to update news arrticles on social media
    """

    def twitter(self, data):
        """
        this function will tweet article title and its url in twitter
        """
        try:
            auth = tweepy.OAuthHandler(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
            auth.set_access_token(settings.TWITTER_ACCESS_TOKEN, settings.TWITTER_ACCESS_TOKEN_SECRET)
            api = tweepy.API(auth)
            api.update_status(data["title"] + "\n" + data["url"])
        except Exception as e:
            print("Error in twitter post: ", e)


class ArticleCreateUpdateView(APIView, SocailMediaPublishing):
    """
    Article create update view
    """
    permission_classes = (IsAuthenticated,)

    def get_tags(self, tags):
        """
        this method will return tag name from tags objects
        """
        tag_list = []
        for tag in tags:
            tag_list.append(tag["name"])
        return tag_list

    def publish(self, obj):
        serializer = ArticleSerializer(obj)
        json_data = serializer.data
        if json_data["hash_tags"]:
            tag_list = self.get_tags(json_data["hash_tags"])
            json_data["hash_tags"] = tag_list
        ingest_to_elastic([json_data], "article", "article", "id")
        tweet_data = {
            "title": serializer.instance.title,
            "url": serializer.instance.source_url,
        }
        self.twitter(tweet_data)

    def post(self, request):
        publish = request.data.get("publish")
        # origin is used to join with cover image
        # to generate proper image url
        origin = request.META.get("HTTP_ORIGIN")
        cover_image_id = request.data.get("cover_image_id")

        if cover_image_id:
            DraftMedia.objects.filter(id=cover_image_id).delete()

        if not request.data.get("cover_image"):
            request.data["cover_image"] = "/".join(
                [origin, request.user.domain.default_image.url])
        context = {"publish": publish, "user": request.user}
        serializer = ArticleCreateUpdateSerializer(
            data=request.data, context=context)
        if serializer.is_valid():
            serializer.save()
            if publish:
                self.publish(serializer.instance)
            return Response(create_response(serializer.data))
        return Response(create_error_response(serializer.errors), status=400)

    def put(self, request):
        _id = request.data.get("id")
        publish = request.data.get("publish")
        # origin is used to join with cover image
        # to generate proper image url
        origin = request.META.get("HTTP_ORIGIN")
        cover_image_id = request.data.get("cover_image_id")
        if cover_image_id:
            DraftMedia.objects.filter(id=cover_image_id).delete()

        if not request.data.get("cover_image"):
            request.data["cover_image"] = "/".join(
                [origin, request.user.domain.default_image.url])
        context = {"publish": publish, "user": request.user}
        article = Article.objects.get(id=_id)
        serializer = ArticleCreateUpdateSerializer(
            article, data=request.data, context=context)
        if serializer.is_valid():
            serializer.save()
            if publish:
                self.publish(serializer.instance)
            return Response(create_response(serializer.data))
        return Response(create_error_response(serializer.errors), status=400)


class ChangeArticleStatusView(APIView, SocailMediaPublishing):
    """
    this view is used to update status of given article activate or deactivate
    """
    permission_classes = (IsAuthenticated,)

    def get_tags(self, tags):
        """
        this method will return tag name from tags objects
        """
        tag_list = []
        for tag in tags:
            tag_list.append(tag["name"])
        return tag_list

    def publish(self, obj):
        serializer = ArticleSerializer(obj)
        json_data = serializer.data
        if obj.active:
            if json_data["hash_tags"]:
                tag_list = self.get_tags(json_data["hash_tags"])
                json_data["hash_tags"] = tag_list
            ingest_to_elastic([json_data], "article", "article", "id")
            tweet_data = {
                "title": serializer.instance.title,
                "url": serializer.instance.source_url,
            }
            self.twitter(tweet_data)
        else:
            delete_from_elastic([json_data], "article", "article", "id")

    def post(self, request):
        _id = request.data.get("id")
        article = Article.objects.filter(id=_id).first()
        if not article:
            return Response(create_error_response({"error": "Article does not exists"}), status=400)
        article.active = request.data.get("activate")
        article.save()
        self.publish(article)
        return Response(create_response({
            "id": article.id, "active": article.active}))


class CategoryBulkUpdate(APIView):
    """
    update whole bunch of articles in one go
    """
    permission_classes = (IsAuthenticated,)

    def get_tags(self, tags):
        """
        this method will return tag name from tags objects
        """
        tag_list = []
        for tag in tags:
            tag_list.append(tag["name"])
        return tag_list

    def post(self, request):
        category_id = request.data['categories']
        category = Category.objects.get(id=category_id)
        for article_id in request.data['articles']:
            current = Article.objects.get(id=article_id)
            current.category = category
            current.save()
            serializer = ArticleSerializer(current)
            json_data = serializer.data
            delete_from_elastic([json_data], "article", "article", "id")

            if json_data["hash_tags"]:
                tag_list = self.get_tags(json_data["hash_tags"])
                json_data["hash_tags"] = tag_list
            ingest_to_elastic([json_data], "article", "article", "id")
        return Response({"ok": "cool"})


class GetDailyDigestView(ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = (AllowAny,)

    def format_response(self, response):
        results = []
        if response.hits.hits:
            for result in response.hits.hits:
                results.append(result["_source"])
        return results

    def get_queryset(self):
        device_id = self.request.GET.get("device_id", "")
        queryset = Devices.objects.filter(device_id=device_id)
        dd = DailyDigest.objects.filter(device__in=queryset)
        if not queryset.exists() or not dd.exists():
            return []
        return dd.first().articles.all().order_by("-published_on")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not queryset:
            sr = Search(using=es, index="article")
            sort = "desc"
            sr = sr.sort({"article_score": {"order": sort}})
            sr = sr.sort({"published_on": {"order": sort}})
            sr = sr[0:20]
            response = sr.execute()
            results = self.format_response(response)
            return Response(create_response({"results": results}))

        serializer = self.get_serializer(queryset, many=True)
        if serializer.data:
            return Response(create_response(serializer.data))
        else:
            return Response(create_error_response({"Msg": "Daily Digest Doesn't Exist"}), status=400)


class DraftMediaUploadViewSet(viewsets.ViewSet):
    """
    this view is used to upload article images
    """
    permission_classes = (IsAuthenticated,)

    def create(self, request):
        image_file = request.data.get("image")
        if not image_file:
            return Response(create_error_response({"error": "Image file is required."}))

        draft_image = DraftMedia.objects.create(image=image_file)
        serializer = DraftMediaSerializer(draft_image)
        return Response(create_response(serializer.data))

    def update(self, request, pk):
        image_file = request.data.get("image")
        if not image_file:
            return Response(create_error_response({"error": "Image file is required."}))

        draft_image = DraftMedia.objects.get(id=pk)
        if not draft_image:
            return Http404

        draft_image.image = image_file
        draft_image.save()
        serializer = DraftMediaSerializer(draft_image)
        return Response(create_response(serializer.data))

    def destroy(self, request, pk):
        draft_image = DraftMedia.objects.get(id=pk)
        if not draft_image:
            return Http404

        draft_image.delete()
        return Response(create_response({"Msg": "Image deleted successfully"}))


class CommentViewSet(viewsets.ViewSet):
    serializer_class = CommentSerializer
    permission_classes = (IsAuthenticated,)
    pagination_class = PostpageNumberPagination
    ordering = "-created_at"

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return [permission() for permission in self.permission_classes]

    def create(self, request):
        captcha_response_key = 0
        captcha_key = request.data.get("captcha_key")
        captcha_value = request.data.get("captcha_value")

        captcha = CaptchaStore.objects.filter(hashkey=captcha_key).first()
        if not captcha:
            return Response(create_error_response({"error": "Invalid Captcha"}))

        if captcha.response != captcha_value.lower():
            return Response(create_error_response({"error": "Invalid Captcha"}))

        data = request.data.copy()
        data["user"] = request.user.id
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(create_response({"result": serializer.data}))
        return Response(create_error_response({"error": "Enter Valid data"}))

    def list(self, request):
        article_id = request.GET.get("article_id", "")
        if not article_id:
            return Response(
                create_error_response(
                    {"error": "Article ID has not been entered by the user"}
                )
            )
        article_obj = Article.objects.filter(id=article_id).first()
        if not article_obj:
            return Response(create_error_response({"error": "Article does not exist"})
                            )
        comment_list = Comment.objects.filter(article=article_obj, reply=None)
        serializer = CommentSerializer(comment_list, many=True)
        return Response(
            create_response(
                {"results": serializer.data, "total_article_likes": ArticleLike.objects.filter(
                    article=article_obj).count()}))

    def destroy(self, request, pk):
        comment_obj = Comment.objects.filter(id=pk)
        if not comment_obj:
            return Response(create_error_response({"error": "Comment does not exist"}))

        comment_obj.delete()
        return Response(create_response({"Msg": "Comment deleted successfully"}))


class LikeAPIView(APIView):
    permission_classes = (IsAuthenticated,)
    pagination_class = PostpageNumberPagination
    ordering = "-created_at"

    def post(self, request):
        post_data = request.data.copy()
        post_data["user"] = request.user.id
        serializer = ArticleLikeSerializer(data=post_data)
        if serializer.is_valid():
            serializer.save()
            if serializer.data.get("id"):
                return Response(create_response({"Msg": "Liked"}))
            return Response(create_response({"Msg": "Removed Like"}))
        return Response(create_error_response({"error": "Invalid Data Entered"}))


class CaptchaCommentApiView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        captcha_len = len(CaptchaStore.objects.all())
        if captcha_len > 500:
            captcha = CaptchaStore.objects.order_by('?')[:1]
            to_json_response = dict()
            to_json_response['status'] = 1
            to_json_response['new_captch_key'] = captcha[0].hashkey
            to_json_response['new_captch_image'] = captcha_image_url(to_json_response['new_captch_key'])
            return Response(create_response({"result": to_json_response}))
        else:
            to_json_response = dict()
            to_json_response['status'] = 1
            to_json_response['new_captch_key'] = CaptchaStore.generate_key()
            to_json_response['new_captch_image'] = captcha_image_url(to_json_response['new_captch_key'])
            return Response(create_response({"result": to_json_response}))


class AutoCompleteAPIView(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def format_response(self, response):
        results = []
        if response['hits']['hits']:
            for result in response['hits']['hits']:
                results.append(result["_source"])
        return results

    def get(self, request):
        result_list = []
        if request.data:
            query = request.data["q"]
        else:
            query = request.GET.get("q", "")
        if query:
            results = es.search(
                index="auto_suggestions",
                body={
                    "suggest": {
                        "results": {
                            "text": query,
                            "completion": {"field": "name_suggest"},
                        }
                    }
                },
            )
            results = results['suggest']['results'][0]['options']
            if results:
                for result in results:
                    result_list.append(
                        {
                            "value": result["_source"]["name_suggest"],
                            "key": result["_source"]["desc"],
                        }
                    )
                return Response(create_response({"result": result_list}))
        return Response(create_response({"result": []}))


class SubsAPIView(ListAPIView):
    serializer_class = SubsMediaSerializer
    permission_classes = (AllowAny,)
    pagination_class = PostpageNumberPagination

    def get(self, request):
        q = self.request.GET.get("q", None)
        subs = Subscription.objects.all()
        if q:
            subs = subs.filter(user__email__icontains=q)
        source = SubsMediaSerializer(subs, many=True)
        return Response(create_response({"results": source.data}))


class UpdateSubsAPIView(APIView):
    serializer_class = SubsMediaSerializer
    permission_classes = (AllowAny,)

    def get(self, request, pk):
        source = SubsMediaSerializer(Subscription.objects.get(id=pk))
        return Response(create_response({"results": source.data}))

    def post(self, request, *args, **kwargs):
        subs_id = self.request.POST.get('id')
        subs = Subscription.objects.filter(id=subs_id)
        if subs.exists():
            subs = subs.first()
            subs.subs_type = self.request.POST.get('subs_type')
            auto_renew = self.request.POST.get('auto_renew')
            if auto_renew == 'No':
                subs.auto_renew = False
            else:
                subs.auto_renew = True
            subs.save()
            return Response(create_response({"results": "success"}))
        return Response(create_response({"results": "error"}))


class AccessSession(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        print(request.META.items())
        request.session["ip"] = request.META.get('REMOTE_ADDR')
        return Response(create_response({"results": request.session._session_key}))
