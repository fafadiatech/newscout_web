# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from core.models import Domain, Menu, Article, Subscription

from django.shortcuts import render
from django.views.generic import TemplateView
from newscout_web.settings import CAPTCHA_ENABLED



class IndexView(TemplateView):
    template_name = "news-index.html"

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context['domain'] = self.request.GET.get('domain', 'newscout')
        return context


class TrendingView(TemplateView):
    template_name = "trending.html"

    def get_context_data(self, **kwargs):
        context = super(TrendingView, self).get_context_data(**kwargs)
        context['domain'] = self.request.GET.get('domain', 'newscout')
        return context


class LatestNewsView(TemplateView):
    template_name = "latest-news.html"

    def get_context_data(self, **kwargs):
        context = super(LatestNewsView, self).get_context_data(**kwargs)
        return context


class CategoryView(TemplateView):
    template_name = "menu-posts.html"

    def get_context_data(self, **kwargs):
        context = super(CategoryView, self).get_context_data(**kwargs)
        context['category'] = self.kwargs['slug']
        context['domain'] = self.request.GET.get('domain', 'newscout')
        return context


class SubCategoryView(TemplateView):
    template_name = "submenu-posts.html"

    def get_context_data(self, **kwargs):
        context = super(SubCategoryView, self).get_context_data(**kwargs)
        context['category'] = self.kwargs['category']
        context['sub_category'] = self.kwargs['sub_category']
        context['domain'] = self.request.GET.get('domain', 'newscout')
        return context


class ArticleDetailView(TemplateView):
    template_name = "article-detail.html"

    def get_context_data(self, **kwargs):
        context = super(ArticleDetailView, self).get_context_data(**kwargs)
        context['domain'] = self.request.GET.get('domain', 'newscout')
        slug = self.kwargs['slug']
        context['slug'] = slug
        context['has_subscribed'] = False
        if not self.request.user.is_anonymous and \
            Subscription.objects.filter(
                user=self.request.user).exclude(subs_type='Basic').exists():
            context['has_subscribed'] = True
        article_id = slug.split("-")[-1]
        context['articleId'] = article_id
        context["captcha_enabled"] = CAPTCHA_ENABLED
        article = Article.objects.filter(slug=slug).first()
        if article:
            context['article_title'] = article.title
            context['article_desc'] = article.blurb
            context['article_url'] = article.source_url
            context['article_image'] = article.cover_image
        return context


class SearchView(TemplateView):
    template_name = "search.html"

    def get_context_data(self, **kwargs):
        context = super(SearchView, self).get_context_data(**kwargs)
        context['domain'] = self.request.GET.get('domain', 'newscout')
        context['query'] = self.request.GET.get('q', '')
        return context


class IBJDomainView(TemplateView):
    template_name = "ibj-index.html"

    def get_context_data(self, **kwargs):
        context = super(IBJDomainView, self).get_context_data(**kwargs)
        return context


class ArticleRSSView(TemplateView):
    template_name = "rss.html"

    def get_context_data(self, **kwargs):
        context = super(ArticleRSSView, self).get_context_data(**kwargs)
        domain = self.request.GET.get('domain', 'newscout')
        domain_obj = Domain.objects.filter(domain_id=domain).first()
        if domain_obj:
            context['domain'] = domain_obj.domain_name
            menus = Menu.objects.filter(domain=domain_obj)
            for menu in menus:
                all_categories = menu.submenu.all()
                for category in all_categories:
                    data[category.name.name] = "/article/rss/?domain=" + domain + "&category=" + category.name.name
        else:
            data = {}

        context['category'] = data
        context["domain"] = domain
        return context


class BookmarkView(TemplateView):
    template_name = "bookmark.html"

    def get_context_data(self, **kwargs):
        context = super(BookmarkView, self).get_context_data(**kwargs)
        context['domain'] = self.request.GET.get('domain', 'newscout')
        return context


class UserChangePasswordView(TemplateView):
    template_name = "user-change-password.html"

    def get_context_data(self, **kwargs):
        context = super(UserChangePasswordView, self).get_context_data(**kwargs)
        context['domain'] = self.request.GET.get('domain', 'newscout')
        return context


class UserProfileView(TemplateView):
    template_name = "user-profile.html"

    def get_context_data(self, **kwargs):
        context = super(UserProfileView, self).get_context_data(**kwargs)
        context['domain'] = self.request.GET.get('domain', 'newscout')
        return context
