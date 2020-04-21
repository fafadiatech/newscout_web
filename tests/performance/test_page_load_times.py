import time
import pytest

from datetime import datetime
from ..core.base import BASE_URL, NSE2ETestBase

@pytest.mark.usefixtures("setup")
class TestPageLoadTime(NSE2ETestBase):

    MAX_THRESHOLD = 3

    urls = [
            '', 'news/trending/', 'news/sector-updates/',
            'news/regional-updates/', 'news/finance/',
            'news/economics/', 'news/misc/', 'news/rss/?domain=newscout'
            ]

    def test_load_speed(self):
        driver = self.driver

        for current in self.urls:
            start = datetime.now()
            URL = f"{BASE_URL}{current}"
            print(f"Checking URL: {URL}")
            driver.get(URL)
            end = datetime.now()
            assert (end - start).seconds < self.MAX_THRESHOLD