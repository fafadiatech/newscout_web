import time
import pytest

from ..core.base import BASE_URL, CREDS, NSE2ETestBase

@pytest.mark.usefixtures("setup")
class TestFrontend(NSE2ETestBase):

    frontend_username = CREDS['frontend']['username']
    frontend_password = CREDS['dashboard']['password']

    def test_trending(self):
        self.check_item_exists_on_page("news/trending/", "/html/body/div[1]/div[2]/div/div[2]/div/div/div[2]/div/div[1]/div/div[1]/div/div/div[2]/h3/a")

    def test_duplicate_on_trending(self):
        driver = self.driver
        driver.get(f"{BASE_URL}news/trending/")

        time.sleep(3)

        titles = []
        for i in range(30):
            element_xpath = f"/html/body/div[1]/div[2]/div/div[2]/div/div/div[2]/div/div[{i+1}]/div/div[1]/div/div/div[2]/h3/a"
            element = driver.find_element_by_xpath(element_xpath)
            assert(element.text != "")
            titles.append(element.text)

        assert(len(titles) == 30)

        # check for duplicates
        # this is simpler way, we can optimize it
        # using dicitonary aswell. for now just works
        for i in range(len(titles)):
            for j in range(len(titles)):
                if i != j:
                    assert(titles[i] != titles[j])

    def calc_percentage_less_than(self, value, items):
        valid_items = [current for current in items if current <= value]

        if len(valid_items) == 0:
            return 0
        else:
            return round(len(valid_items) / float(len(items)), 2)

    def test_trending_freshness(self):
        driver = self.driver
        driver.get(f"{BASE_URL}news/trending/")

        time.sleep(3)

        hours = []

        for i in range(1,31):
            element_xpath = f"/html/body/div[1]/div[2]/div/div[2]/div/div/div[2]/div/div[{i}]/div/div[1]/div/div/div[2]/ul/li"
            element = driver.find_element_by_xpath(element_xpath)
            hours.append(element.text)

        doesnt_have_min_ts = lambda x: x.find("minutes") == -1
        doesnt_have_days_ts = lambda x: x.find("days") == -1 and x.find("day") == -1
        cleanup_hours_ts = lambda x: 1 if x[:x.find("hour")].strip() == "an" else int(x[:x.find("hour")].strip())
        hour_ts = list(map(cleanup_hours_ts, list(filter(doesnt_have_days_ts, list(filter(doesnt_have_min_ts, hours))))))
        hour_ts.sort()

        # ensure latest item is at least 3 hours old
        assert len(hour_ts) > 0 and hour_ts[0] <= 3

        # ensure 30% of items are less than 3 hours old
        assert self.calc_percentage_less_than(3, hour_ts) > 0.30

    def test_search(self):
        self.check_item_exists_on_page("news/search/?q=mumbai", "/html/body/div[1]/div[2]/div/div[2]/div/div/div[3]/div[1]/div/div[2]/div[1]/a")

    def test_rss_page(self):
        self.check_item_exists_on_page("news/rss/?domain=newscout", "/html/body/div[1]/table/tbody/tr[2]/td[1]")

    def test_more_news(self):
        self.check_item_exists_on_page("news/article/renault-launches-bs-vi-compliant-duster-price-starts-at-rs-849000-1499290/", "/html/body/div[1]/div[2]/div/div[2]/div/div/div[2]/div[2]/div/div/div/div[2]/div/h4/a")

    def _test_login(self):
        driver = self.driver
        driver.get(f"{BASE_URL}login/")
        time.sleep(3)
        self.login(self.frontend_username, self.frontend_password)
        error_message = driver.find_element_by_xpath("/html/body/div[1]/form/div[3]/div")
        assert (error_message.text != "Email or Password Is Incorrect")