from django.conf.urls import url
from .views import (IndexView, AllArticlesOpen, ArticlesPerPlatform,
                    ArticlesPerCategory, InteractionsPerCategory,
                    ArticlesPerAuthor, InteractionsPerAuthor,
                    ArticlesPerSession, InteractionsPerSession)

urlpatterns = [
    url(r'^$', IndexView.as_view(), name="index"),
    url(r'^all-articles-open/$',
        AllArticlesOpen.as_view(), name="all-articles-open"),
    url(r'^articles-per-platform/$',
        ArticlesPerPlatform.as_view(), name="articles-per-platform"),
    url(r'^articles-per-category/$',
        ArticlesPerCategory.as_view(), name="articles-per-category"),
    url(r'^interactions-per-category/$',
        InteractionsPerCategory.as_view(), name="interactions-per-category"),
    url(r'^articles-per-author/$',
        ArticlesPerAuthor.as_view(), name="articles-per-author"),
    url(r'^interactions-per-author/$',
        InteractionsPerAuthor.as_view(), name="interactions-per-author"),
    url(r'^aticles-per-session/$',
        ArticlesPerSession.as_view(), name="aticles-per-session"),
    url(r'^interactions-per-session/$',
        InteractionsPerSession.as_view(), name="interactions-per-session")
]   
