import time
import pytest

from .base import BASE_URL, CREDS, NSE2ETestBase

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

    def test_search(self):
        self.check_item_exists_on_page("news/search/?q=mumbai", "/html/body/div[1]/div[2]/div/div[2]/div/div/div[3]/div[1]/div/div[2]/div[1]/a")

    def test_rss_page(self):
        self.check_item_exists_on_page("news/rss/?domain=newscout", "/html/body/div[1]/table/tbody/tr[2]/td[1]")

    def test_more_news(self):
        self.check_item_exists_on_page("news/article/renault-launches-bs-vi-compliant-duster-price-starts-at-rs-849000-1499290/", "/html/body/div[1]/div[2]/div/div[2]/div/div/div[2]/div[2]/div/div/div/div[2]/div/h4/a")

    def test_login(self):
        driver = self.driver
        driver.get(f"{BASE_URL}login/")
        time.sleep(3)
        self.login(self.frontend_username, self.frontend_password)
        error_message = driver.find_element_by_xpath("/html/body/div[1]/form/div[3]/div")
        assert (error_message.text != "Email or Password Is Incorrect")