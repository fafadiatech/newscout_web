from django.conf.urls import url, include
from .views import IndexView, TrendingView, LatestNewsView, MenuPostView, SubmenuPostsView, PostDetailView, SearchView

urlpatterns = [
	url(r'^$', IndexView.as_view(), name="index"),
	url(r'^trending/$', TrendingView.as_view(), name="trending"),
	url(r'^latest/$', LatestNewsView.as_view(), name="latest-news"),
	url(r'^search/$', SearchView.as_view(), name="search-result"),
	url(r'^sector/$', MenuPostView.as_view(), name="sector-updates"),
	url(r'^sector/banking/$', SubmenuPostsView.as_view(), name="submenu-posts"),
	url(r'^post-detail/$', PostDetailView.as_view(), name="post-detail"),
]
