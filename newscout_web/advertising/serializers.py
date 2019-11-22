# -*- coding: utf-8 -*-

from rest_framework import serializers
from advertising.models import (Advertisement, Campaign, AdGroup, AdType)

from api.v1.serializers import CategorySerializer

try:
    from urllib import urlencode, quote
except:
    from urllib.parse import urlencode, quote


class AdvertisementSerializer(serializers.ModelSerializer):

    class Meta:
        model = Advertisement
        fields = ('id', 'ad_text', 'media', 'ad_url')

    ad_url = serializers.SerializerMethodField()

    def get_ad_url(self, instance):
        request = self.context.get("request")
        host = request.META.get("HTTP_HOST")
        utm_source = "NewsCout"
        utm_medium = request.GET.get("category") or " ".join(instance.adgroup.category.all().values_list('name', flat=True))
        utm_campaign = instance.adgroup.campaign.name
        params = urlencode({"utm_source": utm_source, "utm_medium": utm_medium, "utm_campaign": utm_campaign})
        if "&" in instance.ad_url:
            ad_url = instance.ad_url + params
        else:
            ad_url = quote(instance.ad_url + "?" + params)
        print(ad_url)
        url = "http://" + host + "/getad-redirect/?url={0}&aid={1}".format(ad_url, instance.id)
        return url


class CampaignSerializer(serializers.ModelSerializer):

    class Meta:
        model = Campaign
        fields = '__all__'


class CampaignNameIdSerializer(serializers.ModelSerializer):

    class Meta:
        model = Campaign
        fields = ('id', 'name')


class AdGroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdGroup
        fields = '__all__'


class GetAdGroupSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=True, read_only=True)
    campaign = CampaignNameIdSerializer()

    class Meta:
        model = AdGroup
        fields = '__all__'


class AdTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdType
        fields = '__all__'


class GetAdSerializer(serializers.ModelSerializer):
    adgroup = GetAdGroupSerializer(read_only=True)
    ad_type = AdTypeSerializer()

    class Meta:
        model = Advertisement
        fields = ('id', 'adgroup', 'ad_type', 'ad_text', 'ad_url', 'media',
        'is_active', 'impsn_limit')


class AdSerializer(serializers.ModelSerializer):
    media = serializers.ImageField(allow_null=True, max_length=250, required=False)

    class Meta:
        model = Advertisement
        fields = ('id', 'adgroup', 'ad_type', 'ad_text', 'ad_url', 'is_active',
        'media', 'impsn_limit')
