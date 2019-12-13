import time
import requests
from bs4 import BeautifulSoup

from django.core.management.base import BaseCommand
from news_site.models import ScoutFrontier, Category, ScoutedItem


class Command(BaseCommand):
    help = 'This command is used to ingest data from database to elastic search'

    def extract_items(self, category, html):
        """
        this method is used to extract bookmarked items
        """
        soup = BeautifulSoup(html, 'html.parser')
        for item in soup.find_all('a', class_='bookmark_title'):
            try:
                result = ScoutedItem()
                result.category = category
                result.title = item.text[:min(250, len(item.text))]
                result.url = item['href']
                result.save()
            except:
                print("Error processing HTML page")

    def handle(self, *args, **options):
        for category in Category.objects.all():
            print(f"Fetching for category: {category}")
            for current in ScoutFrontier.objects.filter(category=category):
                resp = requests.get(current.url)    
                print(f"Downloaded {current.url}")
                if resp.status_code == 200:
                    self.extract_items(category, resp.text)
                time.sleep(3)