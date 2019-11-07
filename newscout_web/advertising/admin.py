from django.contrib import admin

from .models import Campaign, AdGroup, AdType, Advertisement

admin.site.register(Campaign)
admin.site.register(AdGroup)
admin.site.register(AdType)
admin.site.register(Advertisement)
