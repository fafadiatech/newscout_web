# -*- coding: utf-8 -*-

import random
import operator
from functools import reduce
from typing import Generic
from django.db.models import Q
from rest_framework import filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from django.views.generic.base import RedirectView

from .serializers import  (AdvertisementSerializer, CampaignSerializer,
                           AdGroupSerializer, AdCreateSerializer, GetAdGroupSerializer, AdTypeSerializer, GetAdSerializer)

from api.v1.serializers import CategorySerializer
from api.v1.views import create_response, PostpageNumberPagination
from api.v1.exception_handler import (create_error_response,
                                      CampaignNotFoundException,
                                      AdGroupNotFoundException,
                                      AdvertisementNotFoundException)
from core.models import Category
from advertising.models import (Campaign, AdGroup, AdType, Advertisement)


class GetAds(APIView):
    """
    this api is used to get active ads
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        ads = Advertisement.objects.filter(is_active=True)
        if ads:
            ad = ads[random.randint(0, len(ads)-1)]
            ad.delivered += 1
            ad.save()
            ad_serializer = AdvertisementSerializer(ad, context={"request": request})
            return Response(create_response(ad_serializer.data))
        return Response(create_response({}))


class AdRedirectView(RedirectView):
    """
    this view is used to redirect given add url
    """

    def get_redirect_url(self, *args, **kwargs):
        aid = self.request.GET.get("aid")
        ad_url = self.request.GET.get("url")
        ad = Advertisement.objects.filter(id=aid).first()
        if ad:
            ad.click_count += 1
            ad.save()
            return ad_url
        return Http404


class CampaignCategoriesListView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, format=None, *args, **kwargs):
        """
        List all news category
        """
        categories = CategorySerializer(Category.objects.all(), many=True)
        campaigns = CampaignSerializer(Campaign.objects.all(), many=True)
        return Response(create_response({"categories": categories.data, "campaigns": campaigns.data}))


class GenericAdListAPIView(ListAPIView):
    """
    generic ad list api view
    """
    permission_classes = (AllowAny,)
    pagination_class = PostpageNumberPagination
    filter_backends = (filters.OrderingFilter,)
    ordering = ('-id',)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            if serializer.data:
                paginated_response = self.get_paginated_response(serializer.data)
                return Response(create_response(paginated_response.data))
            else:
                return Response(create_error_response({"Msg" : "Objects Doesn't Exist"}), status=400)

        serializer = self.get_serializer(queryset, many=True)
        return Response(create_response(serializer.data))


class CampaignListView(GenericAdListAPIView):
    """
    campaign list view
    """
    serializer_class = CampaignSerializer

    def get_queryset(self):
        q = self.request.GET.get("q","")
        queryset = Campaign.objects.all()

        if q:
            q_list = q.split(" ")
            condition_1 = reduce(operator.or_, [Q(name__icontains=s) for s in q_list])
            queryset = queryset.filter(condition_1)

        return queryset


class AdGroupListView(GenericAdListAPIView):
    """
    AdGroup list view
    """
    serializer_class = GetAdGroupSerializer

    def get_queryset(self):
        q = self.request.GET.get("q","")
        queryset = AdGroup.objects.all()

        if q:
            q_list = q.split(" ")
            condition_1 = reduce(operator.or_, [Q(category__name__icontains=s) for s in q_list])
            condition_2 = reduce(operator.or_, [Q(campaign__name__icontains=s) for s in q_list])
            queryset = queryset.filter(condition_1|condition_2)

        return queryset.distinct()


class AdvertisementListView(GenericAdListAPIView):
    """
    Advertisement list view
    """
    serializer_class = GetAdSerializer

    def get_queryset(self):
        q = self.request.GET.get("q","")
        queryset = Advertisement.objects.all()

        if q:
            q_list = q.split(" ")
            condition_1 = reduce(operator.or_, [Q(ad_text__icontains=s) for s in q_list])
            queryset = queryset.filter(condition_1)

        return queryset


class CampaignView(APIView):
    """
    this view is used to create,update,list and delete Campaign's
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        """
        create new campaign
        """
        serializer = CampaignSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(create_response(serializer.data))
        return Response(create_error_response(serializer.errors), status=400)

    def put(self, request):
        """
        update existing campaign
        """
        _id = request.data.get("id")
        obj = Campaign.objects.get(id=_id)
        serializer = CampaignSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(create_response(serializer.data))
        return Response(create_error_response(serializer.errors), status=400)


class CampaignDeleteView(APIView):
    """
    this view is used to delete Campaign's
    """
    permission_classes = (AllowAny,)

    def delete(self, request, cid):
        """
        delete existing campaign
        """
        obj = Campaign.objects.filter(id=cid).first()
        if not obj:
            raise CampaignNotFoundException()
        obj.delete()
        return Response(create_response({"Msg": "Campaign deleted successfully"}), status=200)


class AdGroupView(APIView):
    """
    this view is used to create,update,list and delete AdGroup's
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        """
        create new campaign
        """
        categories = request.data.pop("category", None)
        serializer = AdGroupSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            for cat in categories:
                cat_obj = Category.objects.get(id=cat)
                data.category.add(cat_obj)
            return Response(create_response(serializer.data))
        return Response(create_error_response(serializer.errors), status=400)

    def put(self, request):
        """
        update existing adGroup
        """
        _id = request.data.get("id")
        categories = request.data.get("category")
        obj = AdGroup.objects.get(id=_id)
        serializer = AdGroupSerializer(obj, data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            data.category.clear()
            for cat in categories:
                cat_obj = Category.objects.get(id=cat)
                data.category.add(cat_obj)
            return Response(create_response(serializer.data))
        return Response(create_error_response(serializer.errors), status=400)


class AdGroupDeleteView(APIView):
    """
    this view is used to delete AdGroup's
    """
    permission_classes = (AllowAny,)

    def delete(self, request, cid):
        """
        delete existing AdGroup
        """
        obj = AdGroup.objects.filter(id=cid).first()
        if not obj:
            raise AdGroupNotFoundException()
        obj.delete()
        return Response(create_response({"Msg": "AdGroup deleted successfully"}), status=200)


class GroupTypeListView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, format=None, *args, **kwargs):
        """
        List all news category
        """
        groups = GetAdGroupSerializer(AdGroup.objects.all(), many=True)
        types = AdTypeSerializer(AdType.objects.all(), many=True)
        return Response(create_response({"groups": groups.data, "types": types.data}))


class AdvertisementView(APIView):
    """
    this view is used to create, list and update advertisement
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        """
        create new Advertisement
        """
        file_obj = request.data['file']
        serializer = AdCreateSerializer(data=request.data)
        if serializer.is_valid():
            ad = serializer.save()
            ad.media = file_obj
            ad.save()
            return Response(create_response(serializer.data))
        return Response(create_error_response(serializer.errors), status=400)

    def put(self, request):
        """
        update existing Advertisement
        """
        _id = request.data.get("id")
        file_obj = request.data['file']
        obj = Advertisement.objects.get(id=_id)
        if file_obj:
            obj.media = file_obj
            obj.save
        serializer = AdCreateSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(create_response(serializer.data))
        return Response(create_error_response(serializer.errors), status=400)


class AdvertisementDeleteView(APIView):
    """
    this view is used to delete Advertisement's
    """
    permission_classes = (AllowAny,)

    def delete(self, request, cid):
        """
        delete existing Advertisement
        """
        obj = Advertisement.objects.filter(id=cid).first()
        if not obj:
            raise AdvertisementNotFoundException()
        obj.delete()
        return Response(create_response({"Msg": "Advertisement deleted successfully"}), status=200)
