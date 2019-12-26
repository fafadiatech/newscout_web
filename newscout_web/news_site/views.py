# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = "news-index.html"

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        return context


class TrendingView(TemplateView):
	template_name = "trending.html"
	
	def get_context_data(self, **kwargs):
		context = super(TrendingView, self).get_context_data(**kwargs)
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
		return context


class SubCategoryView(TemplateView):
	template_name = "submenu-posts.html"
	
	def get_context_data(self, **kwargs):
		context = super(SubCategoryView, self).get_context_data(**kwargs)
		context['category'] = self.kwargs['category']
		context['sub_category'] = self.kwargs['sub_category']
		return context


class ArticleDetailView(TemplateView):
	template_name = "article-detail.html"
	
	def get_context_data(self, **kwargs):
		context = super(ArticleDetailView, self).get_context_data(**kwargs)
		context['article_id'] = self.kwargs['article_id']
		return context


class SearchView(TemplateView):
	template_name = "search.html"
	
	def get_context_data(self, **kwargs):
		context = super(SearchView, self).get_context_data(**kwargs)
		return context