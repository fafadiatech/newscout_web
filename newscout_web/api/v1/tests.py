# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from advertising.models import Campaign, AdGroup, AdType, Advertisement
from core.models import Category, Article

User = get_user_model()

client = APIClient()
user = User.objects.get(username="rushikesh@fafadiatech.com")
# token = Token.objects.get(user=user)
# client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
client.force_authenticate(user=user)


class NewscoutApiTest(APITestCase):
    def test_get_trending_articles(self):
        res_count = 0
        url = "/api/v1/trending/"
        res = client.get(url, format="json")
        res_count = len(res.data["body"]["results"])
        self.assertGreater(res_count, 0)

    def test_post_category_bulk_update(self):
        res_status = 0
        url = "/api/v1/categories/bulk/"
        data = {
            "categories": "125",
            "articles": {},
        }
        res = client.post(url, data, format="json")
        res_status = res.status_code
        self.assertEqual(res_status, 200)

    def test_get_all_category(self):
        res_count = 0
        url = "/api/v1/categories/"
        res = client.get(url, format="json")
        res_count = len(res.data["body"]["categories"])
        self.assertGreater(res_count, 0)

    def test_post_category_creation(self):
        res_name = ""
        req_name = "Indian Economy"
        url = "/api/v1/categories/"
        post_res = client.post(url, [{"name": req_name}], format="json")
        res_id = post_res.data["body"][0]["id"]
        res = client.get(url)
        for x in res.data["body"]["categories"]:
            if x["id"] == res_id:
                res_name = x["name"]
        self.assertEqual(res_name, req_name)

    def test_put_category_update(self):
        res_name = ""
        req_name = "Food and Vloging"
        req_id = Category.objects.get(id=166).id
        url = "/api/v1/categories/"
        client.put(url, {"id": req_id, "name": req_name}, format="json")
        res = client.get(url)
        for x in res.data["body"]["categories"]:
            if x["id"] == req_id:
                res_name = x["name"]
        self.assertEqual(res_name, req_name)

    def test_get_liked_articles(self):
        res_count = 0
        url = "/api/v1/articles/like-news-list/"
        res = client.get(url, format="json")
        res_count = len(res.data["body"]["results"])
        self.assertGreater(res_count, 0)

    def test_get_fetch_bookmarks(self):
        res_id = 0
        req_id = Article.objects.get(id=998398).id
        url_post_bookmark = "/api/v1/articles/bookmark/"
        client.post(url_post_bookmark, {"article_id": req_id, "user": user.id})
        url = "/api/v1/bookmark-articles/bookmark-news-list/"
        res = client.get(url, format="json")
        for x in res.data["body"]["results"]:
            if x["article"] == req_id:
                res_id = x["article"]
        self.assertEqual(res_id, req_id)

    def test_post_save_tags(self):
        res_msg = ""
        success_msg = "Successfully saved tags"
        url = "/api/v1/tags/save/"
        res = client.post(url, {"tags": "India"}, format="json")
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    def test_get_all_sources(self):
        res_count = 0
        url = "/api/v1/source/"
        res = client.get(url, format="json")
        res_count = len(res.data["body"]["results"])
        self.assertGreater(res_count, 0)

    def test_post_article_bookmark(self):
        res_msg = ""
        success_msg = "Article bookmarked successfully"
        req_id = Article.objects.get(id=998398).id
        url = "/api/v1/articles/bookmark/"
        res = client.post(url, {"article_id": req_id, "user": user.id})
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    def test_get_article_details(self):
        res_id = 0
        req_id = Article.objects.get(id=998398).id
        url = "/api/v1/articles/" + str(req_id) + "/"
        res = client.get(url, format="json")
        res_id = res.data["body"]["article"]["id"]
        self.assertEqual(res_id, req_id)

    def test_post_login(self):
        res_status = 0
        url = "/api/v1/login/"
        data = {
            "device_name": "A",
            "device_id": "A",
            "email": "rushikesh@fafadiatech.com",
            "password": "test123",
        }
        res = client.post(url, data, format="json")
        res_status = res.status_code
        self.assertEqual(res_status, 200)

    def test_get_logout(self):
        res_msg = ""
        url_login = "/api/v1/login/"
        data = {
            "device_name": "A",
            "device_id": "A",
            "email": "rushikesh@fafadiatech.com",
            "password": "test123",
        }
        client.post(url_login, data, format="json")
        url = "/api/v1/logout/"
        success_msg = "User has been logged out"
        res = client.get(url)
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    def test_post_signup(self):
        res_msg = ""
        success_msg = "sign up successfully"
        url = "/api/v1/signup/"
        data = {
            "email": "rs@gmail.com",
            "password": "ftech#123",
            "first_name": "Rishi",
            "last_name": "samantra",
        }
        res = client.post(url, data, format="json")
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    def test_post_forgot_password(self):
        res_msg = ""
        success_msg = "New password sent to your email"
        url = "/api/v1/forgot-password/"
        data = {
            "email": "rushikesh@fafadiatech.com",
        }
        res = client.post(url, data)
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    def test_post_change_password(self):
        res_msg = ""
        success_msg = "Password changed successfully"
        url = "/api/v1/change-password/"
        data = {
            "user": user.id,
            "old_password": "test123",
            "password": "ftech#123",
            "confirm_password": "ftech#123",
        }
        res = client.post(url, data)
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    def test_post_new_device(self):
        res_msg = ""
        success_msg = "Device successfully created"
        url = "/api/v1/device/"
        data = {
            "device_id": "AndroidNX00G",
            "device_name": "AndroidNougat",
        }
        res = client.post(url, data)
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    def test_get_article_search(self):
        res_count = 0
        url = "/api/v1/article/search/?domain=newscout"
        res = client.get(url)
        res_count = len(res.data["body"]["results"])
        self.assertGreater(res_count, 0)

    def test_get_all_menus(self):
        res_count = 0
        url = "/api/v1/menus/?domain=newscout"
        res = client.get(url)
        for x in res.data["body"]["results"]:
            res_count += len(x["heading"])
        self.assertGreater(res_count, 0)

    def test_post_new_article(self):
        res_title_name = ""
        req_title_name = "NBA Preseason has started"
        url = "/api/v1/article/create-update/"
        data = {
            "title": req_title_name,
            "source": "1",
            "source_url": "https://www.nba.com",
            "cover_image": "https://i.pinimg.com/originals/46/61/2d/46612d0fce324acf1d1958f4f50292ec.jpg",
            "blurb": "",
            "published_on": "2019-11-06 12:15:34.870987",
            "spam": "True",
            "domain": "1",
        }
        res = client.post(url, data, format="json")
        res_title_name = res.data["body"]["title"]
        self.assertEqual(res_title_name, req_title_name)

    def test_put_article_update(self):
        res_title_name = ""
        req_id = Article.objects.get(id=998398).id
        req_title_name = "NBA Preseason has started"
        url = "/api/v1/article/create-update/"
        data = {
            "id": req_id,
            "title": req_title_name,
            "source": "1",
            "source_url": "https://www.nba.com",
            "cover_image": "https://i.pinimg.com/originals/46/61/2d/46612d0fce324acf1d1958f4f50292ec.jpg",
            "blurb": "",
            "published_on": "2019-11-06 12:15:34.870987",
            "spam": "True",
            "domain": "1",
        }
        client.put(url, data, format="json")
        url_get_article_details = "/api/v1/articles/" + str(req_id) + "/"
        res = client.get(url_get_article_details, format="json")
        res_title_name = res.data["body"]["article"]["title"]
        self.assertEqual(res_title_name, req_title_name)

    def test_get_daily_digest(self):
        res_count = 0
        url = "/api/v1/daily-digest/"
        res = client.get(url)
        res_count = len(res.data["body"]["results"])
        self.assertGreater(res_count, 0)

    def test_get_article_recommendation(self):
        res_count = 0
        article_id = Article.objects.get(id=998343).id
        url = "/api/v1/articles/" + str(article_id) + "/recommendations/"
        res = client.get(url)
        res_count = len(res.data["body"]["results"])
        self.assertGreater(res_count, 0)

    def test_get_campaign_categories(self):
        res_category_count = 0
        url = "/ads/campaigns/categories/"
        res = client.get(url)
        res_category_count = len(res.data["body"]["categories"])
        self.assertGreater(res_category_count, 0)

    def test_post_campaign_creation(self):
        res_campaign_name = ""
        req_campaign_name = "TestCampaign"
        url = "/ads/campaigns/"
        data = {
            "name": req_campaign_name,
            "is_active": "True",
            "daily_budget": "99.99",
            "max_bid": "89.99",
            "start_date": "2019-11-01 12:15:34.870987",
            "end_date": "2019-11-06 12:15:34.870987",
        }
        client.post(url, data, format="json")
        res = client.get(url)
        if res.data["body"][0]["name"] == req_campaign_name:
            res_campaign_name = res.data["body"][0]["name"]
        self.assertEqual(res_campaign_name, req_campaign_name)

    def test_put_campaign_update(self):
        res_change_name = ""
        req_campaign_name = "TestCampaign"
        url = "/ads/campaigns/"
        data = {
            "name": req_campaign_name,
            "is_active": "True",
            "daily_budget": "99.99",
            "max_bid": "89.99",
            "start_date": "2019-11-01 12:15:34.870987",
            "end_date": "2019-11-06 12:15:34.870987",
        }
        res_post = client.post(url, data, format="json")
        if res_post.data["body"]["name"] == req_campaign_name:
            req_id = res_post.data["body"]["id"]

        req_change_name = "TestCampaign11"
        data = {
            "id": req_id,
            "name": req_change_name,
            "is_active": "True",
            "daily_budget": "99.99",
            "max_bid": "89.99",
            "start_date": "2019-11-01 12:15:34.870987",
            "end_date": "2019-11-06 12:15:34.870987",
        }
        client.put(url, data, format="json")
        res = client.get(url)
        for x in res.data["body"]:
            if x["id"] == req_id:
                res_change_name = x["name"]
        self.assertEqual(res_change_name, req_change_name)

    def test_get_all_campaigns(self):
        res_count = 0
        req_campaign_name = "TestCampaign"
        url = "/ads/campaigns/"
        data = {
            "name": req_campaign_name,
            "is_active": "True",
            "daily_budget": "99.99",
            "max_bid": "89.99",
            "start_date": "2019-11-01 12:15:34.870987",
            "end_date": "2019-11-06 12:15:34.870987",
        }
        client.post(url, data, format="json")
        res = client.get(url)
        res_count = len(res.data["body"])
        self.assertGreater(res_count, 0)

    def test_delete_campaign(self):
        res_msg = ""
        req_campaign_name = "TestCampaign"
        success_msg = "Campaign deleted successfully"
        url_post_campaign = "/ads/campaigns/"
        data = {
            "name": req_campaign_name,
            "is_active": "True",
            "daily_budget": "99.99",
            "max_bid": "89.99",
            "start_date": "2019-11-01 12:15:34.870987",
            "end_date": "2019-11-06 12:15:34.870987",
        }
        res_post = client.post(url_post_campaign, data, format="json")
        req_id = res_post.data["body"]["id"]
        url = "/ads/campaigns/" + str(req_id) + "/"
        res = client.delete(url)
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    def test_get_all_grouptypes(self):
        res_groups_count = 0
        res_types_count = 0
        url = "/ads/grouptypes/"
        res = client.get(url)
        res_groups_count = len(res.data["body"]["groups"])
        res_types_count = len(res.data["body"]["types"])
        self.assertGreater(res_groups_count, 0)
        self.assertGreater(res_types_count, 0)

    def test_get_all_ads(self):
        res_status = 0
        url = "/ads/schedules/"
        res = client.get(url)
        res_status = res.status_code
        self.assertEqual(res_status, 200)

    def test_get_advertisement(self):
        res_count = 0
        url = "/ads/advertisement/"
        res = client.get(url)
        res_count = len(res.data["body"])
        self.assertGreater(res_count, 0)

    def test_post_advertisement_creation(self):
        res_text = ""
        req_text = "NewscoutApiTest"
        adgroup = AdGroup.objects.get(id=1)
        adtype = AdType.objects.get(id=1)
        url = "/ads/advertisement/"
        data = {
            "adgroup": adgroup.id,
            "ad_type": adtype.id,
            "ad_text": req_text,
            "ad_url": "http://newscout.in/",
            "file": "/home/rushikesh/Downloads/20191107_174950.jpg",
            "is_active": "True",
            "impsn_limit": "99",
        }
        res = client.post(url, data)
        res_text = res.data["body"]["ad_text"]
        self.assertEqual(res_text, req_text)

    def test_put_advertisement_update(self):
        res_text = ""
        req_text = "TestNewscout"
        advertisement = Advertisement.objects.get(id=1)
        adgroup = AdGroup.objects.get(id=1)
        adtype = AdType.objects.get(id=1)
        url = "/ads/advertisement/"
        data = {
            "id": advertisement.id,
            "file": "/home/rushikesh/Downloads/20191107_174950.jpg",
            "adgroup": adgroup.id,
            "ad_type": adtype.id,
            "ad_text": req_text,
            "ad_url": "http://newscout.in/",
        }
        res = client.put(url, data)
        if res.data["body"]["id"] == advertisement.id:
            res_text = res.data["body"]["ad_text"]
        self.assertEqual(res_text, req_text)

    def test_delete_advertisement(self):
        res_msg = ""
        success_msg = "Advertisement deleted successfully"
        advertisement = Advertisement.objects.get(id=1)
        url = "/ads/advertisement/" + str(advertisement.id) + "/"
        res = client.delete(url)
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    def test_get_adgroup(self):
        res_count = 0
        url = "/ads/adgroups/"
        res = client.get(url)
        res_count = len(res.data["body"])
        self.assertGreater(res_count, 0)

    def test_post_adgroup_creation(self):
        res_status = 0
        url = "/ads/adgroups/"
        category = [
            Category.objects.get(id=133).id,
            Category.objects.get(id=147).id,
            Category.objects.get(id=160).id,
        ]
        data = {"campaign": 1, "category": category, "is_active": "True"}
        res = client.post(url, data)
        res_status = res.status_code
        self.assertEqual(res_status, 200)

    def test_put_adgroup_update(self):
        res_status = 0
        url = "/ads/adgroups/"
        update_cat = [Category.objects.get(id=147).id, Category.objects.get(id=160).id]
        data = {"id": 1, "campaign": 1, "category": update_cat, "is_active": "True"}
        res = client.put(url, data)
        res_status = res.status_code
        self.assertEqual(res_status, 200)

    def test_delete_adgroup(self):
        res_msg = ""
        adgroup = AdGroup.objects.get(id=1).id
        url = "/ads/adgroups/" + str(adgroup) + "/"
        success_msg = "AdGroup deleted successfully"
        res = client.delete(url)
        res_msg = res.data["body"]["Msg"]
        self.assertEqual(res_msg, success_msg)

    # Social-Login-pending
    
    # hashtags-pending
    