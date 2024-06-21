from django.urls import include, re_path
from .views import (IndexView, AllArticlesOpen, ArticlesPerPlatform,
                    ArticlesPerCategory, InteractionsPerCategory,
                    ArticlesPerAuthor, InteractionsPerAuthor,
                    ArticlesPerSession, InteractionsPerSession)

urlpatterns = [
    re_path(r'^$', IndexView.as_view(), name="index"),
    re_path(r'^all-articles-open/$',
        AllArticlesOpen.as_view(), name="all-articles-open"),
    re_path(r'^articles-per-platform/$',
        ArticlesPerPlatform.as_view(), name="articles-per-platform"),
    re_path(r'^articles-per-category/$',
        ArticlesPerCategory.as_view(), name="articles-per-category"),
    re_path(r'^interactions-per-category/$',
        InteractionsPerCategory.as_view(), name="interactions-per-category"),
    re_path(r'^articles-per-author/$',
        ArticlesPerAuthor.as_view(), name="articles-per-author"),
    re_path(r'^interactions-per-author/$',
        InteractionsPerAuthor.as_view(), name="interactions-per-author"),
    re_path(r'^aticles-per-session/$',
        ArticlesPerSession.as_view(), name="aticles-per-session"),
    re_path(r'^interactions-per-session/$',
        InteractionsPerSession.as_view(), name="interactions-per-session")
]   
