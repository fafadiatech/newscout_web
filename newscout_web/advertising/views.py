# -*- coding: utf-8 -*-

import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views.generic.base import RedirectView

from .serializers import  (AdvertisementSerializer, CampaignSerializer,
                           AdGroupSerializer, AdCreateSerializer, GetAdGroupSerializer, AdTypeSerializer, GetAdSerializer)

from api.v1.views import create_response
from api.v1.serializers import CategorySerializer

from api.v1.exception_handler import (create_error_response,
                                      CampaignNotFoundException,
                                      AdGroupNotFoundException,
                                      AdvertisementNotFoundException)
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


class CampaignView(APIView):
    """
    this view is used to create,update,list and delete Campaign's
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        """
        get list of all campaigns
        """
        campaign_objs = Campaign.objects.all().order_by('-id')
        serializer = CampaignSerializer(campaign_objs, many=True)
        return Response(create_response(serializer.data))

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

    def get(self, request):
        """
        get list of all adgroups
        """
        adgroup_objs = AdGroup.objects.all().order_by('-id')
        serializer = GetAdGroupSerializer(adgroup_objs, many=True)
        return Response(create_response(serializer.data))

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

    def get(self, request):
        """
        get list of all Advertisements
        """
        advertisement_objs = Advertisement.objects.all().order_by('-id')
        serializer = GetAdSerializer(advertisement_objs, many=True)
        return Response(create_response(serializer.data))

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
