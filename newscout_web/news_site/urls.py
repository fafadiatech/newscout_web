from django.conf.urls import url, include
from .views import IndexView, TrendingView, LatestNewsView, CategoryView, SubCategoryView, PostDetailView, SearchView

urlpatterns = [
	url(r'^$', IndexView.as_view(), name="index"),
	url(r'^trending/$', TrendingView.as_view(), name="trending"),
	url(r'^latest-news/$', LatestNewsView.as_view(), name="latest-news"),
	url(r'^search/$', SearchView.as_view(), name="search-result"),
	url(r'^(?P<slug>[-\w\d]+)/$', CategoryView.as_view(), name="menu-posts"),
	url(r'^(?P<category>[-\w\d]+)/(?P<sub_category>[-\w\d]+)/$', SubCategoryView.as_view(), name="submenu-posts"),
	url(r'^post-detail/$', PostDetailView.as_view(), name="post-detail"),
]
