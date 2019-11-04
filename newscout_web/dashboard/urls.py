from django.conf.urls import url, include
from .views import IndexView, CampaignView, GroupView, AdvertisementView

urlpatterns = [
    url(r'^$', IndexView.as_view(), name="index"),
    url(r'^campaigns/$', CampaignView.as_view(), name="campaigns"),
    url(r'^groups/$', GroupView.as_view(), name="groups"),
    url(r'^advertisements/$', AdvertisementView.as_view(), name="advertisements"),
]
