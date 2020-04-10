import time
import pytest
from selenium import webdriver

from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC


options = Options()
# options.add_argument('--headless')


@pytest.fixture(scope='session')
def setup(request):
    chromedriver = "/usr/local/bin/chromedriver"
    print("\nInitiating chrome driver")
    driver = webdriver.Chrome(chromedriver, options=options)
    session = request.node
    for item in session.items:
        cls = item.getparent(pytest.Class)
        setattr(cls.obj, "driver", driver)
    driver.implicitly_wait(30)
    yield driver
    time.sleep(2)
    driver.close()
