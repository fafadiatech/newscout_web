
from django.views.generic.base import TemplateView


class MainIndexView(TemplateView):
    	template_name = "index.html"


class IndexView(TemplateView):
    template_name = "dashboard-index.html"

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context['active_page'] = "dashboard"
        return context


class CampaignView(TemplateView):
	template_name = "dashboard-campaign.html"

	def get_context_data(self, **kwargs):
		context = super(CampaignView, self).get_context_data(**kwargs)
		context['active_page'] = "campaign"
		return context


class GroupView(TemplateView):
	template_name = "dashboard-group.html"

	def get_context_data(self, **kwargs):
		context = super(GroupView, self).get_context_data(**kwargs)
		context['active_page'] = "group"
		return context


class AdvertisementView(TemplateView):
	template_name = "dashboard-advertisement.html"

	def get_context_data(self, **kwargs):
		context = super(AdvertisementView, self).get_context_data(**kwargs)
		context['active_page'] = "advertisement"
		return context


class ArticleView(TemplateView):
	template_name = "dashboard-article.html"

	def get_context_data(self, **kwargs):
		context = super(ArticleView, self).get_context_data(**kwargs)
		context['active_page'] = "article"
		return context


class ArticleCreateView(TemplateView):
	template_name = "dashboard-article-create.html"

	def get_context_data(self, **kwargs):
		context = super(ArticleCreateView, self).get_context_data(**kwargs)
		context['active_page'] = 'article-create'
		return context


class ArticleEditView(TemplateView):
    template_name = "dashboard-article-edit.html"

    def get_context_data(self, **kwargs):
        context = super(ArticleEditView, self).get_context_data(**kwargs)
        context['active_page'] = 'article-edit'
        context['article_id'] = kwargs.get('article_id')
        return context
