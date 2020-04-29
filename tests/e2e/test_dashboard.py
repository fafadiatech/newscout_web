import time
import pytest

from ..core.base import BASE_URL, CREDS, NSE2ETestBase

@pytest.mark.usefixtures("setup")
class TestDashboard(NSE2ETestBase):

    dashboard_username = CREDS['dashboard']['username']
    dashboard_password = CREDS['dashboard']['password']

    def test_dashboard_login(self):
        driver = self.driver
        driver.get(f"{BASE_URL}login/")
        self.login(self.dashboard_username, self.dashboard_password)
        assert (self.page_contains("Dashboard") is not None)

    def test_kpis_rendering(self):
        driver = self.driver
        driver.get(f"{BASE_URL}dashboard/")
        kpi = driver.find_element_by_xpath("/html/body/div[1]/div/div[2]/div/div[2]/div[2]/div[1]/div/div[1]/h3")
        time.sleep(3)
        assert (kpi.text != "0")