import os
import re
import json
import time
import requests

from selenium.webdriver.common.keys import Keys

BASE_URL = "http://Newscout.in/"

# credentials for testing, this is read from 
# credentials.json

CWD = os.path.abspath(os.getcwd())
CREDS = json.loads(open(os.path.join(CWD, "core", "credentials.json")).read())


class NSE2ETestBase():
    # base class for all test classes, cutomize and add func as required

    def login(self, user_name, password):
        """
        Logout user first before loggin. Send email and password as keys.
        App will redirect user to dashboard on successful login
        """
        self.driver.get(BASE_URL + 'logout/')
        self.driver.find_element_by_name("email").click()
        self.driver.find_element_by_name("email").clear()
        self.driver.find_element_by_name("email").send_keys(user_name)
        self.driver.find_element_by_name("password").click()
        self.driver.find_element_by_name("password").clear()
        self.driver.find_element_by_name("password").send_keys(password)
        self.driver.find_element_by_name("password").send_keys(Keys.ENTER)

    def page_contains(self, content):
        """
        Find a given text in a page and assert True if its present, else fail it
        """
        source = self.driver.page_source
        text_found = re.search(rf'\b{content}\b', source)
        return text_found

    def crashes(self, URL):
        """
        Use this to check if url doesnt crashes, should give 200 status code,
        other wise fail it
        """
        self.driver.get(URL)
        status = requests.get(URL)
        return status.status_code

    def get_text_by_attribute(self, _id=None, _class=None, name=None):
        """
        Use this function to find HTML elements by id, class or name attribute
        """
        if _id:
            return self.driver.find_element_by_id(_id)
        elif _class:
            return self.driver.find_elements_by_class_name(_class)
        else:
            return self.driver.find_element_by_name(name)

    def get_text_by_xpath(self, xpath):
        """
        Use this function to find HTML elements XPATH
        """
        return self.driver.find_elements_by_xpath(xpath)

    def fill_element_by_attribute(self, _input, _id=None, _class=None, name=None):
        """
        Use this function to fill HTML elements by id, class or name attribute
        eg: any input tag by id or whatever
        """
        if _id:
            return self.driver.find_element_by_id(_id).send_keys(_input)
        elif _class:
            return self.driver.find_element_by_class_name(_class).send_keys(_input)
        else:
            return self.driver.find_element_by_name(name).send_keys(_input)

    def fill_element_by_xpath(self, xpath, _input):
        """
        Use this function to fill HTML elements by XPATH
        eg: any input tag by id or whatever
        """
        return self.driver.find_element_by_xpath(xpath).send_keys(_input)

    def click_by_attribute(self, _input, _id=None, _class=None):
        """
        Use this function to immetate click event on HTML element by id or class
        attribute eg: any input tag by id or whatever
        """
        if _id:
            return self.driver.find_element_by_id(_id).click()
        elif _class:
            return self.driver.find_element_by_class_name(_class).click()

    def click_by_xpath(self, xpath):
        """
        Use this function to click element by XPATH
        """
        return self.driver.find_element_by_xpath(xpath).click()

    def get_element_by_link_text(self, link):
        """
        Use this function to get element by link attribude by text
        """
        return self.driver.find_element_by_link_text(link).click()

    def switch_to_window(self, window_handles):
        """
        Use this function to switch window
        """
        return self.driver.switch_to.window(window_handles)

    def check_item_exists_on_page(self, url_to_check, first_element_xpath, wait_seconds=3):
        """
        1. Go to a page mentioned in `url_to_check`
        2. Get first element with `first_element_xpath`
        3. Wait for `wait_seconds`
        4. Check for non empty contents
        """
        driver = self.driver
        driver.get("{0}{1}".format(BASE_URL, url_to_check))
        first_item = driver.find_element_by_xpath(first_element_xpath)
        time.sleep(wait_seconds)
        assert (first_item.text != "")