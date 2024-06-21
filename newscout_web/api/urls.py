from django.urls import include, re_path

app_name = 'api'

urlpatterns = [
    re_path(r'^v1/', include('api.v1.urls')),
]
