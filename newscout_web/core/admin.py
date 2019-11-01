# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .models import (Category, BaseUserProfile,
                     Source, HashTag, Article, ArticleMedia,
                     ArticleRating, RelatedArticle, BookmarkArticle, CategoryAssociation,
                    ScoutFrontier, ScoutedItem, TrendingArticle, Menu, SubMenu,
                    CategoryDefaultImage, Domain)

from core.utils import ingest_to_elastic, delete_from_elastic
from api.v1.serializers import ArticleSerializer
from django.utils.translation import gettext_lazy as _
from django.utils.html import mark_safe
from ajax_select import register, LookupChannel, make_ajax_form


admin.site.register(Category)
admin.site.register(Source)
admin.site.register(HashTag)
admin.site.register(ArticleMedia)
admin.site.register(ArticleRating)
admin.site.register(RelatedArticle)
admin.site.register(CategoryAssociation)
admin.site.register(Menu)
admin.site.register(CategoryDefaultImage)
admin.site.register(Domain)


class ArticleEditedByFilter(admin.SimpleListFilter):
    title = _('Edited By')
    parameter_name = 'edited_by'

    def lookups(self, request, model_admin):
        return [(i.id, i.username) for i in BaseUserProfile.objects.filter(is_staff=True)]

    def queryset(self, request, queryset):
        return queryset.filter(edited_by__id=self.value())


@register('category')
class CategoryLookup(LookupChannel):

    model = Category

    def get_query(self, q, request):
          return self.model.objects.filter(name__icontains=q).order_by('name')


class ArticleAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_title', 'source', 'category', 'cover_image', 'published_on')
    list_filter = ('source', 'category', 'published_on', ArticleEditedByFilter)
    exclude = ("hash_tags",)
    search_fields = ('title',)

    form = make_ajax_form(Article, {
        'category': 'category',
    })

    def get_title(self, obj):
        return mark_safe("<a href='{0}' target='_blank'>{1}</a>".format(obj.source_url, obj.title))
    get_title.admin_order_field  = 'title'
    get_title.short_description = 'Title'

    def get_tags(self, tags):
        """
        this method will return tag name from tags objects
        """
        tag_list = []
        for tag in tags:
            tag_list.append(tag["name"])
        return tag_list

    def save_model(self, request, obj, form, change):
        if change:
            obj.edited_by = request.user
            obj.manually_edit = True
            serializer = ArticleSerializer(obj)
            json_data = serializer.data
            if json_data["hash_tags"]:
                tag_list = self.get_tags(json_data["hash_tags"])
                json_data["hash_tags"] = tag_list

            if not obj.spam:
                ingest_to_elastic([json_data], "article", "article", "id")
            else:
                delete_from_elastic([json_data], "article", "article", "id")
            super(ArticleAdmin, self).save_model(request, obj, form, change)

        super(ArticleAdmin, self).save_model(request, obj, form, change)
        serializer = ArticleSerializer(obj)
        json_data = serializer.data
        if json_data["hash_tags"]:
            tag_list = self.get_tags(json_data["hash_tags"])
            json_data["hash_tags"] = tag_list
        ingest_to_elastic([json_data], "article", "article", "id")

admin.site.register(Article,ArticleAdmin)


class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'article')
admin.site.register(BookmarkArticle, BookmarkAdmin)

admin.site.register(ScoutFrontier)
admin.site.register(ScoutedItem)
admin.site.register(TrendingArticle)

class BaseUserProfileAdmin(admin.ModelAdmin):
    exclude = ("passion",)

admin.site.register(BaseUserProfile, BaseUserProfileAdmin)

class SubMenuAdmin(admin.ModelAdmin):
    exclude = ('hash_tags',)

admin.site.register(SubMenu, SubMenuAdmin)
