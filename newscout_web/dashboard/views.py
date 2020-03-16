# -*- coding: utf-8 -*-

from django.views.generic import FormView
from django.http import HttpResponseRedirect
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, authenticate, logout
from django.views.generic.base import TemplateView, RedirectView
from braces.views import LoginRequiredMixin
from django.contrib.auth.views import redirect_to_login
from .forms import LoginForm


class EditorTemplateView(LoginRequiredMixin, TemplateView):
    """
    custom view to restrict view only for news editors
    """

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect_to_login(request.get_full_path(),
                                         self.get_login_url(),
                                         self.get_redirect_field_name())

        if not request.user.is_editor:
            return HttpResponseRedirect("/")
        return super(EditorTemplateView, self).dispatch(
            request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        res = self.render_to_response(context)
        token = request.COOKIES.get("token")
        if not token:
            token, _ = Token.objects.get_or_create(user=request.user)
            res.set_cookie("token", token)
        return res


class MainIndexView(TemplateView):
    	template_name = "index.html"


class IndexView(EditorTemplateView):
    template_name = "dashboard-index.html"

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context['active_page'] = "dashboard"
        return context


class CampaignView(EditorTemplateView):
	template_name = "dashboard-campaign.html"

	def get_context_data(self, **kwargs):
		context = super(CampaignView, self).get_context_data(**kwargs)
		context['active_page'] = "campaign"
		return context


class GroupView(EditorTemplateView):
	template_name = "dashboard-group.html"

	def get_context_data(self, **kwargs):
		context = super(GroupView, self).get_context_data(**kwargs)
		context['active_page'] = "group"
		return context


class AdvertisementView(EditorTemplateView):
	template_name = "dashboard-advertisement.html"

	def get_context_data(self, **kwargs):
		context = super(AdvertisementView, self).get_context_data(**kwargs)
		context['active_page'] = "advertisement"
		return context


class ArticleView(EditorTemplateView):
	template_name = "dashboard-article.html"

	def get_context_data(self, **kwargs):
		context = super(ArticleView, self).get_context_data(**kwargs)
		context['active_page'] = "article"
		return context


class ArticleCreateView(EditorTemplateView):
	template_name = "dashboard-article-create.html"

	def get_context_data(self, **kwargs):
		context = super(ArticleCreateView, self).get_context_data(**kwargs)
		context['active_page'] = 'article-create'
		return context


class ArticleEditView(EditorTemplateView):
    template_name = "dashboard-article-edit.html"

    def get_context_data(self, **kwargs):
        context = super(ArticleEditView, self).get_context_data(**kwargs)
        context['active_page'] = 'article-edit'
        context['article_slug'] = kwargs.get('slug')
        return context


class LoginView(FormView):
    template_name = "login.html"
    form_class = LoginForm
    success_url = "/dashboard/"

    def dispatch(self, request, *args, **kwargs):
        user = request.user
        if user.is_authenticated:
            if user.is_editor:
                return HttpResponseRedirect("/dashboard/")
            else:
                return HttpResponseRedirect("/")
        return super(LoginView, self).dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        email = form.cleaned_data['email']
        password = form.cleaned_data['password']
        next_url = self.request.GET.get("next")
        user = authenticate(request=None, username=email, password=password)
        if user and user.is_active:
            login(self.request, user)
            token, _ = Token.objects.get_or_create(user=user)
            if next_url:
                res = HttpResponseRedirect(next_url)
                res.set_cookie("token", token)
                return res
            else:
                res = HttpResponseRedirect(self.get_success_url())
                res.set_cookie("token", token)
                return res

        return self.form_invalid(form)


class LogOutView(RedirectView):
    """
    logout view
    """

    def get_redirect_url(self):
        url = "/login/"
        logout(self.request)
        return url

    def get(self, request, *args, **kwargs):
        url = self.get_redirect_url()
        res = HttpResponseRedirect(url)
        res.delete_cookie("token")
        return res
