"""django_ft_news_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Import the include() function: from django.conf.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.urls import include, re_path
from django.contrib import admin
from ajax_select import urls as ajax_select_urls
from dashboard.views import (
    MainIndexView,
    LoginView,
    LogOutView,
    ChangePasswordView,
    EtherpadView,
)
from news_site.views import IndexView, UserChangePasswordView, UserProfileView
from core.feed import ArticlesFeed

app_name = "newscout_web"

urlpatterns = [
    re_path(r"^$", IndexView.as_view(), name="index"),
    re_path(r"^login/$", LoginView.as_view(), name="login"),
    re_path(r"^logout/$", LogOutView.as_view(), name="logout"),
    re_path(r"^change-password/$", ChangePasswordView.as_view(), name="change-password"),
    re_path(
        r"^user/change-password/$",
        UserChangePasswordView.as_view(),
        name="user-change-password",
    ),
    re_path(r"^user/profile/$", UserProfileView.as_view(), name="user-profile"),
    re_path(r"^etherpad/(?P<slug>[\w-]+)/$", EtherpadView.as_view(), name="etherpad"),
    re_path(r"^analytics/", include("analytics.urls")),
    re_path(r"^dashboard/", include("dashboard.urls")),
    re_path(r"^news/", include("news_site.urls")),
    re_path(r"^ajax_select/", include(ajax_select_urls)),
    re_path(r"^admin/", admin.site.urls),
    re_path(r"^api/", include("api.urls")),
    re_path(r"^event/", include("event_tracking.urls")),
    re_path(r"^adapi/", include("advertising.urls")),
    re_path(r"^article/rss/", ArticlesFeed(), name="news-item"),
    re_path(r"^captcha/", include("captcha.urls")),
]
