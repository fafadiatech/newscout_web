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
from django.conf.urls import url, include
from django.contrib import admin
from ajax_select import urls as ajax_select_urls
from dashboard.views import MainIndexView, LoginView, LogOutView, ChangePasswordView
from news_site.views import IndexView, UserChangePasswordView, UserProfileView
from core.feed import ArticlesFeed

app_name = 'newscout_web'

urlpatterns = [
    url(r'^$', IndexView.as_view(), name="index"),
    url(r'^login/$', LoginView.as_view(), name="login"),
    url(r'^logout/$', LogOutView.as_view(), name="logout"),
    url(r'^change-password/$', ChangePasswordView.as_view(), name="change-password"),
    url(r'^user/change-password/$', UserChangePasswordView.as_view(), name="user-change-password"),
    url(r'^user/profile/$', UserProfileView.as_view(), name="user-profile"),
    url(r'^analytics/', include('analytics.urls')),
    url(r'^dashboard/', include('dashboard.urls')),
    url(r'^news/', include('news_site.urls')),
    url(r'^ajax_select/', include(ajax_select_urls)),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include('api.urls')),
    url(r'^event/', include('event_tracking.urls')),
    url(r'^ads/', include('advertising.urls')),
    url(r'^article/rss/', ArticlesFeed(), name="news-item"),
    url(r'^captcha/', include('captcha.urls'))
]
