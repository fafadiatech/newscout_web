from django.views.generic.base import TemplateView


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