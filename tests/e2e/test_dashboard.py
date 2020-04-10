import pytest

from .base import BASE_URL, CREDS, NSE2ETestBase

@pytest.mark.usefixtures("setup")
class TestDashboard(NSE2ETestBase):

    dashboard_username = CREDS['dashboard']['username']
    dashboard_password = CREDS['dashboard']['password']

    def test_dashboard_login(self):
        driver = self.driver
        driver.get(f"{BASE_URL}login/")
        self.login(self.dashboard_username, self.dashboard_password)
        assert (self.page_contains("Dashboard") is not None)
        test_url = f'{BASE_URL}'