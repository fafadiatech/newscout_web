from django.urls import include, re_path
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
    re_path(r"^$", IndexView.as_view(), name="index"),
    re_path(r"^campaigns/$", CampaignView.as_view(), name="campaigns"),
    re_path(r"^groups/$", GroupView.as_view(), name="groups"),
    re_path(r"^advertisements/$", AdvertisementView.as_view(), name="advertisements"),
    re_path(r"^articles/$", ArticleView.as_view(), name="articles"),
    re_path(r"^article/create/$", ArticleCreateView.as_view(), name="article-create"),
    re_path(
        r"^article/edit/(?P<slug>[\w-]+)/$",
        ArticleEditView.as_view(),
        name="article-edit",
    ),
    re_path(r"^qc/$", QCToolView.as_view(), name="qc-tool"),
    re_path(r"^subscription/$", SubscriptionView.as_view(), name="subscriptions"),
    re_path(
        r"^subscription/(?P<pk>[\w-]+)/$",
        SubscriptionView.as_view(),
        name="subscriptions",
    ),
]
