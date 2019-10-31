from django.urls import path
from .views import TrackerAPI, ActivityLogAPI, NewsCoutLogAPI

urlpatterns = [
    path('track/', TrackerAPI.as_view()),
    path('activity/', ActivityLogAPI.as_view()),
    path('newscout-logs/', NewsCoutLogAPI.as_view())
]
