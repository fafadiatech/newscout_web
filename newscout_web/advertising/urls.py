# -*- coding: utf-8 -*-

from os.path import basename
from django.urls import include, re_path

from rest_framework.routers import DefaultRouter

from .views import (GetAds, CampaignViewSet, AdGroupViewSet,
                    AdvertisementViewSet, CampaignCategoriesListView,
                    GroupTypeListView, AdRedirectView)

url_router = DefaultRouter()
url_router.register(r'campaigns', CampaignViewSet, basename='campaign')
url_router.register(r'adgroups', AdGroupViewSet, basename='adgroup')
url_router.register(
    r'advrtismnt',  AdvertisementViewSet, basename='advertisement')


urlpatterns = [
    re_path('', include(url_router.urls)),
    re_path(r'^schedules/$', GetAds.as_view(), name='get-ads'),
    re_path(r'^categories/$', CampaignCategoriesListView.as_view(),
        name='campign-categories-view'),
    re_path(r'^grouptypes/$', GroupTypeListView.as_view(), name='group-type-view'),
    re_path(r'^redirect/$', AdRedirectView.as_view(),
        name='get-ads-redirect')
]
