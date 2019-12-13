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


class MenuPostView(TemplateView):
	template_name = "menu-posts.html"
	
	def get_context_data(self, **kwargs):
		context = super(MenuPostView, self).get_context_data(**kwargs)
		return context


class SubmenuPostsView(TemplateView):
	template_name = "submenu-posts.html"
	
	def get_context_data(self, **kwargs):
		context = super(SubmenuPostsView, self).get_context_data(**kwargs)
		return context


class PostDetailView(TemplateView):
	template_name = "postdetail.html"
	
	def get_context_data(self, **kwargs):
		context = super(PostDetailView, self).get_context_data(**kwargs)
		return context


class SearchView(TemplateView):
	template_name = "search.html"
	
	def get_context_data(self, **kwargs):
		context = super(SearchView, self).get_context_data(**kwargs)
		return context