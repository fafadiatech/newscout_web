from django.conf.urls import url, include
from .views import (
    IndexView,
    CampaignView,
    GroupView,
    AdvertisementView,
    ArticleView,
    ArticleCreateView,
    ArticleEditView,
    QCToolView,
    SubscriptionView,
)

urlpatterns = [
    url(r"^$", IndexView.as_view(), name="index"),
    url(r"^campaigns/$", CampaignView.as_view(), name="campaigns"),
    url(r"^groups/$", GroupView.as_view(), name="groups"),
    url(r"^advertisements/$", AdvertisementView.as_view(), name="advertisements"),
    url(r"^articles/$", ArticleView.as_view(), name="articles"),
    url(r"^article/create/$", ArticleCreateView.as_view(), name="article-create"),
    url(
        r"^article/edit/(?P<slug>[\w-]+)/$",
        ArticleEditView.as_view(),
        name="article-edit",
    ),
    url(r"^qc/$", QCToolView.as_view(), name="qc-tool"),
    url(r"^subscription/$", SubscriptionView.as_view(), name="subscriptions"),
    url(
        r"^subscription/(?P<pk>[\w-]+)/$",
        SubscriptionView.as_view(),
        name="subscriptions",
    ),
]
