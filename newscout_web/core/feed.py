from django.contrib.syndication.views import Feed
from django.urls import reverse
from core.models import Article, Category, Source
from django.utils import feedgenerator
from django.http import Http404
from django.core.paginator import Paginator


class CustomFeedGenerator(feedgenerator.DefaultFeed):
    def add_item_elements(self, handler, item):
        super(CustomFeedGenerator, self).add_item_elements(handler, item)
        handler.addQuickElement("source", str(item['source']))
        handler.addQuickElement("category", str(item['category']))
        handler.addQuickElement("publishedOn", str(item['publishedOn']))
        handler.addQuickElement("image", str(item['image']))


class ArticlesFeed(Feed):
    title = ''
    link = ''
    description = ''
    paginate_by = 10
    feed_type = CustomFeedGenerator

    def items(self, value):
        paginate_by = 10
        if 'page' in value:
            page_no = value['page']
            article = Article.objects.order_by('-published_on')
            
            if value['category'] and value['source']:
                if Category.objects.filter(name=value['category']).exists() and Source.objects.filter(name=value['source']).exists():
                    article = article.filter(
                        category=Category.objects.filter(name=value['category']).first(), 
                        source=Source.objects.filter(name=value['source']).first()
                    ).order_by('-published_on')

            elif value['category']:
                if Category.objects.filter(name=value['category']).exists():
                    article = article.filter(category=Category.objects.filter(name=value['category']).first()).order_by('-published_on')

            elif value['source']:
                if Source.objects.filter(name=value['source']).exists():
                    article = article.filter(source=Source.objects.filter(name=value['source']).first()).order_by('-published_on')
            results = Paginator(article, paginate_by)
            return results.get_page(page_no)
        else:        
            raise Http404("Provide Page Number")
    
    def get_object(self, request, *args, **kwargs):
        value = {}
        value['category'] = request.GET.get('category')
        value['source'] = request.GET.get('source')
        value['page'] = int(request.GET.get('page', 1))
        return value

    def item_title(self, item):
        return item.title

    def item_source(self, item):
        return item.source

    def item_category(self, item):
        return item.category

    def item_publishedOn(self, item):
        return item.publishedOn

    def item_image(self, item):
        return item.image

    def item_description(self, item):
        return item.blurb

    def item_link(self, item):
        return item.source_url 

    def item_extra_kwargs(self, obj):
        return { 'image': obj.cover_image,'source' : obj.source,'category' : obj.category,'publishedOn' : obj.published_on}