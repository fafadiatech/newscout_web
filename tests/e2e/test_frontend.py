import time
import pytest

from .base import BASE_URL, CREDS, NSE2ETestBase

@pytest.mark.usefixtures("setup")
class TestFrontend(NSE2ETestBase):

    def test_trending(self):
        driver = self.driver
        driver.get(f"{BASE_URL}news/trending/")
        first_item = driver.find_element_by_xpath("/html/body/div[1]/div[2]/div/div[2]/div/div/div[2]/div/div[1]/div/div[1]/div/div/div[2]/h3/a")
        time.sleep(3)
        assert (first_item.text != "")