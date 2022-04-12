from .views import (
    CategoryListAPIView,
    ArticleListAPIView,
    SignUpAPIView,
    LoginAPIView,
    LogoutAPIView,
    SourceListAPIView,
    ArticleDetailAPIView,
    ArticleBookMarkAPIView,
    ArticleRecommendationsAPIView,
    ForgotPasswordAPIView,
    ChangePasswordAPIView,
    UserHashTagAPIView,
    BookmarkArticleAPIView,
    ArticleLikeAPIView,
    HashTagAPIView,
    ArticleSearchAPI,
    MenuAPIView,
    DevicesAPIView,
    NotificationAPIView,
    SocialLoginView,
    TrendingArticleAPIView,
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
    DomainsListAPIView,
    UsersListAPIView,
    SendInvitationView,
    SyncEtherpadView,
    RelatedAPIView,
)
from django.urls import include, re_path

from rest_framework.routers import DefaultRouter

from rest_framework_swagger.views import get_swagger_view

schema_view = get_swagger_view(title="Newscout API Documentation")


url_router = DefaultRouter()
url_router.register(
    r"article/draft-image", DraftMediaUploadViewSet, basename="draft-media"
)
url_router.register(r"comment", CommentViewSet, basename="comment")

urlpatterns = [
    re_path("", include(url_router.urls)),
    re_path(r"^documentation/", schema_view),
    re_path(r"^trending/$", TrendingArticleAPIView.as_view(), name="trending"),
    re_path(
        r"^categories/bulk/$", CategoryBulkUpdate.as_view(), name="category-bulk-update"
    ),
    re_path(r"^categories/$", CategoryListAPIView.as_view(), name="category-list"),
    re_path(r"^articles/$", ArticleListAPIView.as_view(), name="articles-list"),
    re_path(
        r"^articles/like-news-list/$",
        ArticleLikeAPIView.as_view(),
        name="users-articles-list",
    ),
    re_path(
        r"^bookmark-articles/bookmark-news-list/$",
        BookmarkArticleAPIView.as_view(),
        name="user-bookmarks",
    ),
    re_path(r"^tags/$", HashTagAPIView.as_view(), name="hash-tags"),
    re_path(r"^tags/save/$", UserHashTagAPIView.as_view(), name="save-tags"),
    re_path(r"^source/$", SourceListAPIView.as_view(), name="source-list"),
    re_path(r"^domains/$", DomainsListAPIView.as_view(), name="domains-list"),
    re_path(r"^users/$", UsersListAPIView.as_view(), name="users-list"),
    re_path(r"^articles/vote/$", ArticleDetailAPIView.as_view(), name="vote-article"),
    re_path(
        r"^articles/bookmark/$",
        ArticleBookMarkAPIView.as_view(),
        name="bookmark-article",
    ),
    re_path(
        r"^articles/(?P<slug>[\w-]+)/$",
        ArticleDetailAPIView.as_view(),
        name="articles-list",
    ),
    re_path(
        r"^articles/(?P<article_id>[-\d]+)/recommendations/$",
        ArticleRecommendationsAPIView.as_view(),
        name="articles-list",
    ),
    re_path(r"^signup/$", SignUpAPIView.as_view(), name="signup"),
    re_path(r"^login/$", LoginAPIView.as_view(), name="login"),
    re_path(r"^logout/$", LogoutAPIView.as_view(), name="logout"),
    re_path(r"^forgot-password/$", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    re_path(r"^change-password/$", ChangePasswordAPIView.as_view(), name="change-password"),
    re_path(r"^article/search", ArticleSearchAPI.as_view(), name="article-search"),
    re_path(r"^menus/$", MenuAPIView.as_view(), name="menus"),
    re_path(r"^device/$", DevicesAPIView.as_view(), name="device"),
    re_path(r"^notification/$", NotificationAPIView.as_view(), name="notification"),
    re_path(r"^social-login/$", SocialLoginView.as_view(), name="social-login"),
    re_path(
        r"^article/create-update/$",
        ArticleCreateUpdateView.as_view(),
        name="article-create-update",
    ),
    re_path(r"^article/status/$", ChangeArticleStatusView.as_view(), name="article-status"),
    re_path(r"^suggest/$", AutoCompleteAPIView.as_view(), name="suggest"),
    re_path(r"^related/$", RelatedAPIView.as_view(), name="related"),
    re_path(r"daily-digest/$", GetDailyDigestView.as_view(), name="daily-digest"),
    re_path(r"article-like/$", LikeAPIView.as_view(), name="article-like"),
    re_path(r"comment-captcha/$", CaptchaCommentApiView.as_view(), name="comment-captcha"),
    re_path(r"subscription/$", SubsAPIView.as_view(), name="subscriptions-api"),
    re_path(
        r"subscription/(?P<pk>[\w-]+)/$",
        UpdateSubsAPIView.as_view(),
        name="update-subscriptions-api",
    ),
    re_path(r"userprofile/$", UserProfileAPIView.as_view(), name="userprofile"),
    re_path(r"access-session/$", AccessSession.as_view(), name="access-session-api"),
    re_path(r"rss/$", RSSAPIView.as_view(), name="rss-api"),
    re_path(r"send-invitation/$", SendInvitationView.as_view(), name="send-invitation"),
    re_path(r"sync-etherpad/$", SyncEtherpadView.as_view(), name="update-etherpad"),
]
