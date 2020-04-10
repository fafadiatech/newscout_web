import time
import pytest

from .base import BASE_URL, CREDS, NSE2ETestBase

@pytest.mark.usefixtures("setup")
class TestFrontend(NSE2ETestBase):

    def test_trending(self):
        self.check_item_exists_on_page("news/trending/", "/html/body/div[1]/div[2]/div/div[2]/div/div/div[2]/div/div[1]/div/div[1]/div/div/div[2]/h3/a")

    def test_search(self):
        self.check_item_exists_on_page("news/search/?q=mumbai", "/html/body/div[1]/div[2]/div/div[2]/div/div/div[3]/div[1]/div/div[2]/div[1]/a")

    def test_rss_page(self):
        self.check_item_exists_on_page("news/rss/?domain=newscout", "/html/body/div[1]/table/tbody/tr[2]/td[1]")