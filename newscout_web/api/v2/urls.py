from .views import (
    CategoryAPI,
    ArticleListAPI,
    SignUpAPIView,
    LoginAPIView,
    LogoutAPIView,
    SourceAPI,
    ArticleDetailAPIView,
    ArticleBookMarkAPIView,
    ArticleRecommendationsAPIView,
    ForgotPasswordAPIView,
    ChangePasswordAPIView,
    UserHashTagAPIView,
    BookmarkArticleAPI,
    ArticleLikeAPI,
    HashTagAPIView,
    ArticleSearchAPI,
    MenuAPI,
    DevicesAPIView,
    NotificationAPIView,
    SocialLoginView,
    TrendingArticleAPI,
    ArticleCreateUpdateView,
    CategoryBulkUpdate,
    GetDailyDigestView,
    ChangeArticleStatusView,
    DraftMediaUploadViewSet,
    CommentViewSet,
    LikeAPIView,
    CaptchaCommentApiView,
    SubsAPIView,
    AutoCompleteAPIView,
    UpdateSubsAPIView,
    UserProfileAPIView,
    AccessSession,
    RSSAPIView,
    DomainsAPI,
    UsersAPI,
    SendInvitationView,
    SyncEtherpadView,
    RelatedAPIView,
)
from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter

from rest_framework_swagger.views import get_swagger_view

schema_view = get_swagger_view(title="Newscout API Documentation")


url_router = DefaultRouter()
url_router.register(
    r"article/draft-image", DraftMediaUploadViewSet, basename="draft-media"
)
url_router.register(r"comment", CommentViewSet, basename="comment")
url_router.register(r"categories", CategoryAPI, basename="category")

urlpatterns = [
    url("", include(url_router.urls)),
    url(r"^documentation/", schema_view),
    url(r"^trending/$", TrendingArticleAPI.as_view({'get': 'list'}), name="trending"),
    url(
        r"^categories/bulk/$", CategoryBulkUpdate.as_view(), name="category-bulk-update"
    ),
    url(r"^articles/$", ArticleListAPI.as_view({'get': 'list'}), name="articles-list"),
    url(
        r"^articles/like-news-list/$",
        ArticleLikeAPI.as_view({'get': 'list'}),
        name="users-articles-list",
    ),
    url(
        r"^bookmark-articles/bookmark-news-list/$",
        BookmarkArticleAPI.as_view({'get': 'list'}),
        name="user-bookmarks",
    ),
    url(r"^tags/$", HashTagAPIView.as_view(), name="hash-tags"),
    url(r"^tags/save/$", UserHashTagAPIView.as_view(), name="save-tags"),
    url(r"^source/$", SourceAPI.as_view({'get': 'list'}), name="source-list"),
    url(r"^domains/$", DomainsAPI.as_view({'get': 'list'}), name="domains-list"),
    url(r"^users/$", UsersAPI.as_view({'get': 'list'}), name="users-list"),
    url(r"^articles/vote/$", ArticleDetailAPIView.as_view(), name="vote-article"),
    url(
        r"^articles/bookmark/$",
        ArticleBookMarkAPIView.as_view(),
        name="bookmark-article",
    ),
    url(
        r"^articles/(?P<slug>[\w-]+)/$",
        ArticleDetailAPIView.as_view(),
        name="articles-list",
    ),
    url(
        r"^articles/(?P<article_id>[-\d]+)/recommendations/$",
        ArticleRecommendationsAPIView.as_view(),
        name="articles-list",
    ),
    url(r"^signup/$", SignUpAPIView.as_view(), name="signup"),
    url(r"^login/$", LoginAPIView.as_view(), name="login"),
    url(r"^logout/$", LogoutAPIView.as_view(), name="logout"),
    url(r"^forgot-password/$", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    url(r"^change-password/$", ChangePasswordAPIView.as_view(), name="change-password"),
    url(r"^article/search", ArticleSearchAPI.as_view(), name="article-search"),
    url(r"^menus/$", MenuAPI.as_view({'get': 'list'}), name="menus"),
    url(r"^device/$", DevicesAPIView.as_view(), name="device"),
    url(r"^notification/$", NotificationAPIView.as_view(), name="notification"),
    url(r"^social-login/$", SocialLoginView.as_view(), name="social-login"),
    url(
        r"^article/create-update/$",
        ArticleCreateUpdateView.as_view(),
        name="article-create-update",
    ),
    url(r"^article/status/$", ChangeArticleStatusView.as_view(), name="article-status"),
    url(r"^suggest/$", AutoCompleteAPIView.as_view(), name="suggest"),
    url(r"^related/$", RelatedAPIView.as_view(), name="related"),
    url(r"daily-digest/$", GetDailyDigestView.as_view(), name="daily-digest"),
    url(r"article-like/$", LikeAPIView.as_view(), name="article-like"),
    url(r"comment-captcha/$", CaptchaCommentApiView.as_view(), name="comment-captcha"),
    url(r"subscription/$", SubsAPIView.as_view(), name="subscriptions-api"),
    url(
        r"subscription/(?P<pk>[\w-]+)/$",
        UpdateSubsAPIView.as_view(),
        name="update-subscriptions-api",
    ),
    url(r"userprofile/$", UserProfileAPIView.as_view(), name="userprofile"),
    url(r"access-session/$", AccessSession.as_view(), name="access-session-api"),
    url(r"rss/$", RSSAPIView.as_view(), name="rss-api"),
    url(r"send-invitation/$", SendInvitationView.as_view(), name="send-invitation"),
    url(r"sync-etherpad/$", SyncEtherpadView.as_view(), name="update-etherpad"),
]
