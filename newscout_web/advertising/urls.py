# -*- coding: utf-8 -*-

from django.conf.urls import url

from rest_framework.urlpatterns import format_suffix_patterns

from .views import (GetAds, CampaignView,
                    CampaignDeleteView, AdGroupView, AdGroupDeleteView,
                    AdvertisementView, AdvertisementDeleteView,
                    CampaignCategoriesListView, GroupTypeListView,
                    AdRedirectView)

urlpatterns = [
    url(r'^get-ads/$', GetAds.as_view(), name='get-ads'),
    url(r'campaign-categories/$', CampaignCategoriesListView.as_view(),
        name='campign-categories-view'),
    url(r'campaign/$', CampaignView.as_view(), name='campign-view'),
    url(r'campaign/(?P<cid>[-\d]+)/$', CampaignDeleteView.as_view(),
        name='campign-view-delete'),
    url(r'group-type/$', GroupTypeListView.as_view(), name='group-type-view'),
    url(r'adgroup/$', AdGroupView.as_view(), name='adgroup-view'),
    url(r'adgroup/(?P<cid>[-\d]+)/$', AdGroupDeleteView.as_view(),
        name='adgroup-view-delete'),
    url(r'advertisement/$', AdvertisementView.as_view(),
        name='advertisement-view'),
    url(r'advertisement/(?P<cid>[-\d]+)/$', AdvertisementDeleteView.as_view(),
        name='advertisement-view-delete'),
    url(r'^getad-redirect/$', AdRedirectView.as_view(),
        name='get-ads-redirect'),
]
urlpatterns = format_suffix_patterns(urlpatterns)
