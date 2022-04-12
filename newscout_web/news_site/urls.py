from django.urls import include, re_path
from .views import IndexView, TrendingView, LatestNewsView, CategoryView, SubCategoryView, ArticleDetailView, SearchView, IBJDomainView, ArticleRSSView, BookmarkView

urlpatterns = [
    re_path(r'^$', IndexView.as_view(), name="index"),
    re_path(r'^domain/ibj/$', IBJDomainView.as_view(), name="ibj-domain-index"),
    re_path(r'^trending/$', TrendingView.as_view(), name="trending"),
    re_path(r'^latest-news/$', LatestNewsView.as_view(), name="latest-news"),
    re_path(r'^rss/$', ArticleRSSView.as_view(), name="rss"),
    re_path(r'^search/$', SearchView.as_view(), name="search-result"),
    re_path(r'^bookmark/$', BookmarkView.as_view(), name="bookmark"),
    re_path(r'^article/(?P<slug>[-\w\d]+)/$', ArticleDetailView.as_view(), name="article-detail"),
    re_path(r'^(?P<slug>[-\w\d]+)/$', CategoryView.as_view(), name="menu-posts"),
    re_path(r'^(?P<category>[-\w\d]+)/(?P<sub_category>[-\w\d]+)/$', SubCategoryView.as_view(), name="submenu-posts"),

]
