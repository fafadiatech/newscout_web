# -*- coding: utf-8 -*-

from os.path import basename
from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter

from .views import (GetAds, CampaignViewSet, AdGroupViewSet,
                    AdvertisementViewSet, CampaignCategoriesListView,
                    GroupTypeListView, AdRedirectView)

url_router = DefaultRouter()
url_router.register(r'campaigns', CampaignViewSet, basename='campaign')
url_router.register(r'adgroups', AdGroupViewSet, basename='adgroup')
url_router.register(
    r'advertisements', AdvertisementViewSet, basename='advertisement')


urlpatterns = [
    url('', include(url_router.urls)),
    url(r'^schedules/$', GetAds.as_view(), name='get-ads'),
    url(r'^categories/$', CampaignCategoriesListView.as_view(),
        name='campign-categories-view'),
    url(r'^grouptypes/$', GroupTypeListView.as_view(), name='group-type-view'),
    url(r'^redirect/$', AdRedirectView.as_view(),
        name='get-ads-redirect')
]
