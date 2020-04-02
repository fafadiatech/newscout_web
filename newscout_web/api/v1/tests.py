# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from advertising.models import Campaign, AdGroup, AdType, Advertisement
from core.models import (
    Category,
    Article,
    BookmarkArticle,
    Source,
    Domain,
    Menu,
    Devices,
    DailyDigest,
    ArticleLike,
    Comment,
)
from rest_framework.authtoken.models import Token


User = get_user_model()
client = APIClient()
user = User.objects.get(username="rushikesh@fafadiatech.com")
client.force_authenticate(user=user)


class TestGetTrendingArticles(APITestCase):
    """
    this testcase is use to test GET request that fetches those articles which are trending
    """

    def test_get_trending_articles(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT OF CATEGORIES: COUNT (INT) 
        """
        url = "/api/v1/trending/"
        res = client.get(url, format="json")
        self.assertGreater(len(res.data["body"]["results"]), 0)
        self.assertEqual(res.status_code, 200)


class TestUpdateMultipleArticles(APITestCase):
    """
    this testcase is use to test POST request that update multiple articles in one go
    """

    def test_post_article_bulk_update(self):
        """
        Method:
            POST

        POST Data:
            CATEGORIES : ID (INT)
            ARTICLES : IDS (LIST)

        Assert:
            RESPONSE_STATUS_CODE: 200    
        """
        url = "/api/v1/categories/bulk/"
        data = {
            "categories": 125,
            "articles": [998398, 998396, 998391],
        }
        res = client.post(url, data, format="json")
        self.assertEqual(res.status_code, 200)


class TestGetNewsCategories(APITestCase):
    """
    this testcase is use to test GET request that fetches all news categories
    """

    def setUp(self):
        self.test_categories = Category.objects.values_list("name", flat=True)

    def test_get_all_category(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT OF CATEGORIES: COUNT (INT)
            CATEGORY NAMES: NAME (STRING)
        """
        url = "/api/v1/categories/"
        res = client.get(url, format="json")
        for cat in res.data["body"]["categories"]:
            self.assertIn(cat["name"], self.test_categories)
        self.assertGreater(len(res.data["body"]["categories"]), 0)
        self.assertEqual(res.status_code, 200)


class TestCreateNewCategory(APITestCase):
    """
    this testcase is use to test POST request that create new News category
    """

    def test_post_category_creation(self):
        """
        Method:
            POST

        POST Data:
            CATEGORY NAME : NAME (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            CATEGORY NAME : NAME (STRING)
        """
        url = "/api/v1/categories/"
        data = {"name": "Indian Economy"}
        res = client.post(url, [data], format="json")
        self.assertEqual(res.data["body"][0]["name"], data["name"])
        self.assertEqual(res.status_code, 200)


class TestUpdateCategory(APITestCase):
    """
    this testcase is use to test PUT request that updates category
    """

    def setUp(self):
        self.category = Category.objects.first()

    def test_put_category_update(self):
        """
        Method:
            PUT

        PUT Data:
            CATEGORY : ID (INT)
            CATEGORY NAME : NAME (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            CATEGORY NAME : NAME (STRING)
        """
        res_name = ""
        data = {"id": self.category.id, "name": "Food and Vloging"}
        url = "/api/v1/categories/"
        res = client.put(url, data, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["body"]["name"], data["name"])


class TestGetLikedArticles(APITestCase):
    """
    this testcase is use to test GET request that gets all the liked articles
    """

    def setUp(self):
        self.article = Article.objects.last()
        self.liked_article = ArticleLike.objects.create(
            article=self.article, user=user, is_like=1
        )

    def test_get_liked_articles(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT LIKED ARTICLES: COUNT (INT)
        """
        url = "/api/v1/articles/like-news-list/"
        res = client.get(url, format="json")
        self.assertGreater(len(res.data["body"]["results"]), 0)
        self.assertEqual(res.status_code, 200)


class TestGetBookmarks(APITestCase):
    """
    this testcase is use to test GET request that fetches bookmarked articles
    """

    def setUp(self):
        self.article = Article.objects.first()
        self.bookmark = BookmarkArticle.objects.create(article=self.article, user=user)

    def test_get_fetch_bookmarks(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            BOOKMARK ID : ID (INT)
            ARTICLE ID : ID (INT)
        """
        url = "/api/v1/bookmark-articles/bookmark-news-list/"
        res = client.get(url, format="json")
        self.assertEqual(res.data["body"]["results"][0]["id"], self.bookmark.id)
        self.assertEqual(res.data["body"]["results"][0]["article"], self.article.id)
        self.assertEqual(res.status_code, 200)


class TestSaveTags(APITestCase):
    """
    this testcase is use to test POST request that saves tags
    """

    def test_post_save_tags(self):
        """
        Method:
            POST

        POST Data:
            TAGS : STRING

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE MESSAGE : MSG (STRING)
        """
        url = "/api/v1/tags/save/"
        data = {"tags": "India"}
        res = client.post(url, data, format="json")
        self.assertEqual(res.data["body"]["Msg"], "Successfully saved tags")
        self.assertEqual(res.status_code, 200)


class TestGetSources(APITestCase):
    """
    this testcase is use to test GET request that gets all the available sources in Newscout
    """

    def setUp(self):
        self.test_sources = Source.objects.values_list("name", flat=True)

    def test_get_all_sources(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            SOURCES: NAME (STRING)
            COUNT OF SOURCES: COUNT(INT)
        """
        url = "/api/v1/source/"
        res = client.get(url, format="json")
        for source in res.data["body"]["results"]:
            self.assertIn(source["name"], self.test_sources)
        self.assertGreater(len(res.data["body"]["results"]), 0)
        self.assertEqual(res.status_code, 200)


class TestCreateBookmarks(APITestCase):
    """
    this testcase is used to test POST request to bookmark an article
    """

    def setUp(self):
        self.article_bookmarked = Article.objects.first()
        bookmarked_obj = BookmarkArticle.objects.create(
            user=user, article=self.article_bookmarked
        )
        self.article = Article.objects.last()

    def test_post_article_bookmark(self):
        """
        Method:
            POST

        POST Data:
            ARTICLE : ID (INT)
            USER : ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE MESSAGE: MSG (STRING)
        """
        url = "/api/v1/articles/bookmark/"
        data = {"article_id": self.article.id, "user": user.id}
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["Msg"], "Article bookmarked successfully")
        self.assertEqual(
            res.data["body"]["bookmark_article"]["article"], self.article.id
        )
        self.assertEqual(res.status_code, 200)

    def test_post_article_bookmark_failed(self):
        """
        Method:
            POST

        POST Data:
            ARTICLE : ID (INT)
            USER : ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE MESSAGE: MSG (STRING)
        """
        url = "/api/v1/articles/bookmark/"
        data = {"article_id": self.article_bookmarked.id, "user": user.id}
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["Msg"], "Article removed from bookmark list")
        self.assertEqual(
            res.data["body"]["bookmark_article"]["article"], self.article_bookmarked.id
        )
        self.assertEqual(res.status_code, 200)


class TestGetArticleDetails(APITestCase):
    """
    this testcase is used to test GET request that fetches details of a particular article by its id
    """

    def setUp(self):
        self.article = Article.objects.last()

    def test_get_article_details(self):
        """
        Method:
            GET

        Query_String:
            ARTICLE: ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ARTICLE_ID: ID (STRING)
            ARTICLE_TITLE: TITLE (STRING)
            ARTICLE_CATEGORY: CATEGORY (STRING)
            ARTICLE_SOURCE: SOURCE (STRING)
            ARTICLE_COVER_IMAGE: COVER_IMAGE (STRING)
        """
        url = "/api/v1/articles/{0}/".format(self.article.id)
        res = client.get(url, format="json")
        self.assertEqual(res.data["body"]["article"]["id"], self.article.id)
        self.assertEqual(res.data["body"]["article"]["title"], self.article.title)
        self.assertEqual(
            res.data["body"]["article"]["category"], self.article.category.name
        )
        self.assertEqual(
            res.data["body"]["article"]["source"], self.article.source.name
        )
        self.assertEqual(
            res.data["body"]["article"]["cover_image"], self.article.cover_image
        )
        self.assertEqual(res.status_code, 200)


class TestLogin(APITestCase):
    """
    this testcase is used to test POST request to login using email and password
    """

    def setUp(self):
        self.test_user = User.objects.get(username="rushikesh@fafadiatech.com")
        self.token, _ = Token.objects.get_or_create(user=self.test_user)

    def test_post_login(self):
        """
        Method:
            POST

        POST Data:
            DEVICE NAME : NAME (STRING)
            DEVICE ID : ID (INT)
            EMAIL : ID (PROPER EMAIL) (STRING)
            PASSWORD : PASSWORD (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            USER_ID: ID (INT)
            TOKEN : (RANDOM STRING)
            USER_FIRST_NAME: NAME (STRING)
            USER_LAST_NAME: NAME (STRING)
        """
        url = "/api/v1/login/"
        data = {
            "device_name": "A",
            "device_id": 1,
            "email": "rushikesh@fafadiatech.com",
            "password": "test123",
        }
        res = client.post(url, data, format="json")
        self.assertEqual(res.data["body"]["user"]["token"], self.token.key)
        self.assertEqual(res.data["body"]["user"]["id"], self.test_user.id)
        self.assertEqual(
            res.data["body"]["user"]["first_name"], self.test_user.first_name
        )
        self.assertEqual(
            res.data["body"]["user"]["last_name"], self.test_user.last_name
        )
        self.assertEqual(res.status_code, 200)


class TestLogout(APITestCase):
    """
    this testcase is used to test GET request to logout 
    """

    def test_get_logout(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url_login = "/api/v1/login/"
        data = {
            "device_name": "A",
            "device_id": "A",
            "email": "rushikesh@fafadiatech.com",
            "password": "test123",
        }
        client.post(url_login, data, format="json")
        url = "/api/v1/logout/"
        res = client.get(url)
        self.assertEqual(res.data["body"]["Msg"], "User has been logged out")
        self.assertEqual(res.status_code, 200)


class TestSignup(APITestCase):
    """
    this testcase is used to test POST request to signup for a new user
    """

    def test_post_signup(self):
        """
        Method:
            POST

        POST Data:
            EMAIL : ID (STRING)
            PASSWORD : PASSWORD (STRING)
            FIRST_NAME : NAME (STRING)
            LAST_NAME : NAME (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/api/v1/signup/"
        data = {
            "email": "rs@gmail.com",
            "password": "ftech#123",
            "first_name": "Rishi",
            "last_name": "samantra",
        }
        res = client.post(url, data, format="json")
        self.assertEqual(res.data["body"]["Msg"], "sign up successfully")
        self.assertEqual(res.status_code, 200)

    def test_post_error_signup(self):
        """
        Method:
            POST

        POST Data:
            EMAIL : ID (STRING)
            PASSWORD : PASSWORD (STRING)
            LAST_NAME : NAME (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 403
        """
        url = "/api/v1/signup/"
        data = {
            "email": "rs@gmail.com",
            "password": "ftech#123",
            "last_name": "samantra",
        }
        res = client.post(url, data, format="json")
        self.assertEqual(res.status_code, 403)


class TestForgetPassword(APITestCase):
    """
    this testcase is used to test POST request to change password of an user
    """

    def test_post_forgot_password(self):
        """
        Method:
            POST

        POST Data:
            EMAIL : ID (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/api/v1/forgot-password/"
        data = {
            "email": "rushikesh@fafadiatech.com",
        }
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["Msg"], "New password sent to your email")
        self.assertEqual(res.status_code, 200)

    def test_post_error_forgot_password(self):
        """
        Method:
            POST

        POST Data:
            EMAIL : WRONG ID (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: ERROR MSG (STRING)  
        """
        url = "/api/v1/forgot-password/"
        data = {
            "email": "rishikesh@fafadiatech.com",
        }
        res = client.post(url, data)
        self.assertEqual(res.data["errors"]["Msg"], "Email Does Not Exist")
        self.assertEqual(res.status_code, 200)


class TestPasswordChange(APITestCase):
    """
    this testcase is used to test POST request to change password of an user
    """

    def test_post_change_password(self):
        """
        Method:
            POST

        POST Data:
            USER_ID: ID (INT)
            USER_OLD_PASSWORD: PASSWORD (STRING)
            USER_PASSWORD: PASSWORD (STRING)
            USER_CONFIRM_PASSWORD: PASSWORD (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/api/v1/change-password/"
        data = {
            "user": user.id,
            "old_password": "test123",
            "password": "ftech#123",
            "confirm_password": "ftech#123",
        }
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["Msg"], "Password changed successfully")
        self.assertEqual(res.status_code, 200)

    def test_post_wrong_old_password(self):
        """
        Method:
            POST

        POST Data:
            USER_ID: ID (INT)
            USER_OLD_PASSWORD: WRONG OLD PASSWORD (STRING)
            USER_PASSWORD: PASSWORD (STRING)
            USER_CONFIRM_PASSWORD: PASSWORD (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/api/v1/change-password/"
        data = {
            "user": user.id,
            "old_password": "test12",
            "password": "ftech#123",
            "confirm_password": "ftech#123",
        }
        res = client.post(url, data)
        self.assertEqual(
            res.data["errors"]["Msg"], "Old Password Does Not Match With User"
        )
        self.assertEqual(res.status_code, 200)

    def test_post_error_password_confirmation(self):
        """
        Method:
            POST

        POST Data:
            USER_ID: ID (INT)
            USER_OLD_PASSWORD: PASSWORD (STRING)
            USER_PASSWORD: WRONG PASSWORD (STRING)
            USER_CONFIRM_PASSWORD: WRONG PASSWORD (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/api/v1/change-password/"
        data = {
            "user": user.id,
            "old_password": "ftech#123",
            "password": "ftech#1234",
            "confirm_password": "ftech#12345",
        }
        res = client.post(url, data)
        self.assertEqual(
            res.data["errors"]["Msg"], "Password and Confirm Password does not match"
        )
        self.assertEqual(res.status_code, 200)

    def test_post_same_passwords(self):
        """
        Method:
            POST

        POST Data:
            USER_ID: ID (INT)
            USER_OLD_PASSWORD: SAME PASSWORD (STRING)
            USER_PASSWORD: SAME PASSWORD (STRING)
            USER_CONFIRM_PASSWORD: SAME PASSWORD (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/api/v1/change-password/"
        data = {
            "user": user.id,
            "old_password": "ftech#123",
            "password": "ftech#123",
            "confirm_password": "ftech#123",
        }
        res = client.post(url, data)
        self.assertEqual(
            res.data["errors"]["Msg"], "New password should not same as Old password"
        )
        self.assertEqual(res.status_code, 200)

    def test_post_missing_old_password(self):
        """
        Method:
            POST

        POST Data:
            USER_ID: ID (INT)
            USER_PASSWORD: PASSWORD (STRING)
            USER_CONFIRM_PASSWORD: PASSWORD (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/api/v1/change-password/"
        data = {
            "user": user.id,
            "password": "ftech#123",
            "confirm_password": "ftech#123",
        }
        res = client.post(url, data)
        self.assertEqual(res.data["errors"]["Msg"], "Old Password field is required")
        self.assertEqual(res.status_code, 200)


class TestNewDevice(APITestCase):
    """
    this testcase is used to test POST request to create new device
    """

    def setUp(self):
        Devices.objects.create(device_id=123, device_name="AndroidOreo")

    def test_post_new_device(self):
        """
        Method:
            POST

        POST Data:
            DEVICE_ID : ID (INT)
            DEVICE_NAME : DEVICE_NAME (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/api/v1/device/"
        data = {
            "device_id": 1,
            "device_name": "AndroidNougat",
        }
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["Msg"], "Device successfully created")
        self.assertEqual(res.status_code, 200)


class TestArticleSearch(APITestCase):
    """
    this testcase is used to test GET request for article search
    """

    def test_get_article_search(self):
        """
        Method:
            GET

        Query_String:
            DOMAIN: Domain ID (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT OF ARTICLES: COUNT (INT)
            DOMAIN NAME OF ARTICLES: DOMAIN (STRING)
        """
        url = "/api/v1/article/search/?domain=newscout"
        res = client.get(url)
        for article in res.data["body"]["results"]:
            self.assertEqual(article["domain"], "newscout")
        self.assertEqual(res.status_code, 200)
        self.assertGreater(len(res.data["body"]["results"]), 0)


class TestGetMenus(APITestCase):
    """
    this testcase is used to test GET request to fetch all Menus
    """

    def setUp(self):
        self.test_menus = []
        domain = Domain.objects.get(domain_name="NewsCout")
        self.menus = Menu.objects.filter(domain=domain)
        for menu in self.menus:
            self.test_menus.append(menu.name.name)

    def test_get_all_menus(self):
        """
        Method:
            GET

        Query_String:
            DOMAIN: ID

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT OF MENUS: COUNT (INT)
            MENU: NAME (STRING)
        """
        res_count = 0
        url = "/api/v1/menus/?domain=newscout"
        res = client.get(url)
        res_status = res.status_code
        for menu in res.data["body"]["results"]:
            self.assertIn(menu["heading"]["name"], self.test_menus)
            res_count += len(menu["heading"])
        self.assertGreater(res_count, 0)
        self.assertEqual(res.status_code, 200)


class TestCreateNewArticle(APITestCase):
    """
    this testcase is used to test POST request that creates a new article
    """

    def setUp(self):
        self.source = Source.objects.first()
        self.category = Category.objects.last()
        self.domain = Domain.objects.first()

    def test_post_new_article(self):
        """
        Method:
            POST

        POST Data:
            TITLE: NAME (STRING)
            SOURCE: ID (INT)
            SOURCE_URL: URL (STRING)
            CATEGORY: ID (INT)
            COVER_IMAGE: URL (STRING)
            BLURB: TEXT (STRING)
            PUBLISHED_ON: DATETIME (STRING)
            SPAM: (BOOLEAN)
            DOMAIN: ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ARTICLE_TITLE: NAME (STRING)
            ARTICLE_SOURCE: ID (INT)
            ARTICLE_SOURCE_URL: URL (STRING)
            ARTICLE_CATEGORY: ID (INT)
            ARTICLE_COVER_IMAGE: URL (STRING)
            ARTICLE_SPAM: (BOOLEAN)
            ARTICLE_DOMAIN: ID (INT)
        """
        url = "/api/v1/article/create-update/"
        data = {
            "title": "NBA Preseason has started",
            "source": self.source.id,
            "source_url": "https://www.nba.com",
            "category": self.category.id,
            "cover_image": "https://i.pinimg.com/originals/46/61/2d/46612d0fce324acf1d1958f4f50292ec.jpg",
            "blurb": "",
            "published_on": "2019-11-06 12:15:34.870987",
            "spam": True,
            "domain": self.domain.id,
        }
        res = client.post(url, data, format="json")
        self.assertEqual(res.data["body"]["title"], data["title"])
        self.assertEqual(res.data["body"]["source"], data["source"])
        self.assertEqual(res.data["body"]["source_url"], data["source_url"])
        self.assertEqual(res.data["body"]["category"], data["category"])
        self.assertEqual(res.data["body"]["cover_image"], data["cover_image"])
        self.assertEqual(res.data["body"]["spam"], data["spam"])
        self.assertEqual(res.data["body"]["domain"], data["domain"])
        self.assertEqual(res.status_code, 200)


class TestChangeArticleStatus(APITestCase):
    """
    this testcase is used to test POST request to change status of an article(activate or deactivate)
    """

    def setUp(self):
        self.article = Article.objects.filter(active=True).last()

    def test_post_change_status(self):
        """
        Method:
            POST

        POST DATA:
            ARTICALE : ID (INT)
            ACTIVATE : (BOOLEAN)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ARTICLE : ID (INT)
            STATUS: (BOOLEAN)
        """
        url = "/api/v1/article/status/"
        data = {"id": self.article.id, "activate": False}
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["id"], self.article.id)
        self.assertNotEqual(res.data["body"]["active"], self.article.active)
        self.assertEqual(res.status_code, 200)

    def test_post_error_change_status(self):
        """
        Method:
            POST

        POST DATA:
            ACTIVATE : (BOOLEAN)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE : ERROR MSG (STRING)
        """
        url = "/api/v1/article/status/"
        data = {"activate": False}
        res = client.post(url, data)
        self.assertEqual(res.data["errors"]["error"], "Article does not exists")
        self.assertEqual(res.status_code, 400)


class TestUpdateArticle(APITestCase):
    """
    this testcase is used to test PUT request that updates article details
    """

    def setUp(self):
        self.article_id = 998398
        self.article = Article.objects.get(id=self.article_id)
        self.source = Source.objects.first()
        self.category = Category.objects.last()
        self.domain = Domain.objects.first()

    def test_put_article_update(self):
        """
        Method:
            PUT

        PUT Data:
            ID: ID (INT)
            TITLE: NAME (STRING)
            SOURCE: ID (INT)
            SOURCE_URL: URL (STRING)
            CATEGORY: ID (INT)
            COVER_IMAGE: URL (STRING)
            BLURB: TEXT (STRING)
            PUBLISHED_ON: DATETIME (STRING)
            SPAM: (BOOLEAN)
            DOMAIN: ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ARTICLE_TITLE: NAME (STRING)
            ARTICLE_SOURCE: ID (INT)
            ARTICLE_SOURCE_URL: URL (STRING)
            ARTICLE_CATEGORY: ID (INT)
            ARTICLE_COVER_IMAGE: URL (STRING)
            ARTICLE_SPAM: (BOOLEAN)
            ARTICLE_DOMAIN: ID (INT)
        """
        og_title = self.article.title
        url = "/api/v1/article/create-update/"
        data = {
            "id": self.article_id,
            "title": "NBA Preseason has started",
            "source": self.source.id,
            "category": self.category.id,
            "source_url": "https://www.nba.com",
            "cover_image": "https://i.pinimg.com/originals/46/61/2d/46612d0fce324acf1d1958f4f50292ec.jpg",
            "blurb": "",
            "published_on": "2019-11-06 12:15:34.870987",
            "spam": True,
            "domain": self.domain.id,
        }
        res = client.put(url, data, format="json")
        self.assertNotEqual(res.data["body"]["title"], self.article.title)
        self.assertNotEqual(res.data["body"]["source"], self.article.source)
        self.assertNotEqual(res.data["body"]["category"], self.article.category)
        self.assertEqual(res.data["body"]["title"], data["title"])
        self.assertEqual(res.data["body"]["source"], data["source"])
        self.assertEqual(res.data["body"]["source_url"], data["source_url"])
        self.assertEqual(res.data["body"]["category"], data["category"])
        self.assertEqual(res.data["body"]["cover_image"], data["cover_image"])
        self.assertEqual(res.data["body"]["spam"], data["spam"])
        self.assertEqual(res.data["body"]["domain"], data["domain"])
        self.assertEqual(res.status_code, 200)


class TestDailyDigest(APITestCase):
    """
    this testcase is used to test GET request that fetches Daily Digest
    """

    def setUp(self):
        self.device, _ = Devices.objects.get_or_create(
            device_id="AAAAAAAAAAA", device_name="android", user=user
        )
        self.article = Article.objects.last()
        self.daily_digest, _ = DailyDigest.objects.get_or_create(device=self.device)
        self.daily_digest.articles.clear()
        self.daily_digest.articles.add(self.article)
        self.daily_digest.save()

    def test_get_daily_digest(self):
        """
        Method:
            GET

        Query_String:
            DEVICE_ID: ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ARTICLE_ID: ID (INT)
            ARTICLE_TITLE: NAME (STRING)
            ARTICLE_SOURCE: NAME (STRING)
            ARTICLE_CATEGORY: NAME (STRING)
            ARTICLE_SOURCE_URL: URL (STRING)
            ARTICLE_CATEGORY: ID (INT)
            COUNT OF THE ARTICLES: COUNT (INT)
        """
        url = "/api/v1/daily-digest/?device_id={0}".format(self.device.device_id)
        res = client.get(url)
        self.assertEqual(res.data["body"][0]["id"], self.article.id)
        self.assertEqual(res.data["body"][0]["title"], self.article.title)
        self.assertEqual(res.data["body"][0]["source"], self.article.source.name)
        self.assertEqual(res.data["body"][0]["category"], self.article.category.name)
        self.assertEqual(res.data["body"][0]["source_url"], self.article.source_url)
        self.assertEqual(res.data["body"][0]["category_id"], self.article.category.id)
        self.assertGreater(len(res.data["body"]), 0)
        self.assertEqual(res.status_code, 200)


class TestArticleRecommendation(APITestCase):
    """
    this testcase is used to test GET request that fetches articles related to given article
    """

    def setUp(self):
        self.article = Article.objects.last()

    def test_get_article_recommendation(self):
        """
        Method:
            GET

        Query_String:
            ARTICLE_ID: ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT OF THE ARTICLES: COUNT (INT) 
        """
        url = "/api/v1/articles/{0}/recommendations/".format(self.article.id)
        res = client.get(url)
        self.assertGreater(len(res.data["body"]["results"]), 0)
        self.assertEqual(res.status_code, 200)

    def test_get_error_article_recommendation(self):
        """
        Method:
            GET

        Query_String:
            ARTICLE_ID: INVALID ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE : ERROR MSG (STRING)
        """
        invalid_id = 1
        url = "/api/v1/articles/{0}/recommendations/".format(invalid_id)
        res = client.get(url)
        self.assertEqual(res.data["errors"]["Msg"], "Error generating recommendation")
        self.assertEqual(res.status_code, 200)


class TestGetCampaignCategories(APITestCase):
    """
    this testcase is used to test GET request that fetches all news categories and campaigns
    """

    def setUp(self):
        self.test_categories = Category.objects.values_list("name", flat=True)
        self.test_campaigns = Campaign.objects.values_list("name", flat=True)

    def test_get_campaign_categories(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            CATEGORIES: NAME (STRING)
            CAMPAIGNS: NAME (STRING)
        """
        url = "/ads/categories/"
        res = client.get(url)
        for cat in res.data["body"]["categories"]:
            self.assertIn(cat["name"], self.test_categories)
        for camp in res.data["body"]["campaigns"]:
            self.assertIn(camp["name"], self.test_campaigns)
        self.assertEqual(res.status_code, 200)


class TestCreateCampaign(APITestCase):
    """
    this testcase is used to test POST request for creating a campaign
    """

    def test_post_campaign_creation(self):
        """
        Method:
            POST

        POST Data:
            NAME: TEXT (STRING)
            IS_ACTIVE: (BOOLEAN)
            DAILY_BUDGET: NUMBER (STRING)
            MAX_BID: NUMBER (STRING)
            START_DATE: DATETIME (STRING)
            END_DATE: DATETIME (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            CAMPAIGN_NAME: TEXT (STRING)
            CAMPAIGN_IS_ACTIVE: (BOOLEAN)
            CAMPAIGN_DAILY_BUDGET: NUMBER (STRING)
            CAMPAIGN_MAX_BID: NUMBER (STRING)
        """
        url = "/ads/campaigns/"
        data = {
            "name": "TestCampaign",
            "is_active": True,
            "daily_budget": "99.78",
            "max_bid": "89.99",
            "start_date": "2019-11-01 12:15:34.870987",
            "end_date": "2019-11-06 12:15:34.870987",
        }
        res = client.post(url, data, format="json")
        self.assertEqual(res.data["body"]["name"], data["name"])
        self.assertEqual(res.data["body"]["is_active"], data["is_active"])
        self.assertEqual(res.data["body"]["daily_budget"], data["daily_budget"])
        self.assertEqual(res.data["body"]["max_bid"], data["max_bid"])
        self.assertEqual(res.status_code, 200)


class TestUpdateCampaign(APITestCase):
    """
    this testcase is used to test POST request for updating a campaign
    """

    def setUp(self):
        self.campaign = Campaign.objects.last()
        self.test_campaign_name = self.campaign.name
        self.test_campaign_daily_budget = self.campaign.daily_budget
        self.test_campaign_max_bid = self.campaign.max_bid

    def test_put_campaign_update(self):
        """
        Method:
            PUT

        PUT Data:
            ID: ID (INT)
            NAME: TEXT (STRING)
            IS_ACTIVE: (BOOLEAN)
            DAILY_BUDGET: NUMBER (STRING)
            MAX_BID: NUMBER (STRING)
            START_DATE: DATETIME (STRING)
            END_DATE: DATETIME (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            CAMPAIGN_ID: ID (STRING)
            CAMPAIGN_NAME: TEXT (STRING)
            CAMPAIGN_IS_ACTIVE: (BOOLEAN)
            CAMPAIGN_DAILY_BUDGET: NUMBER (STRING)
            CAMPAIGN_MAX_BID: NUMBER (STRING)
        """
        url = "/ads/campaigns/{0}/".format(self.campaign.id)
        data = {
            "id": self.campaign.id,
            "name": "TestCampaignChanged",
            "is_active": True,
            "daily_budget": "999.99",
            "max_bid": "889.99",
            "start_date": "2019-11-01 12:15:34.870987",
            "end_date": "2019-11-06 12:15:34.870987",
        }
        res = client.put(url, data, format="json")
        self.assertNotEqual(res.data["body"]["name"], self.test_campaign_name)
        self.assertNotEqual(
            res.data["body"]["daily_budget"], self.test_campaign_daily_budget
        )
        self.assertNotEqual(res.data["body"]["max_bid"], self.test_campaign_max_bid)
        self.assertEqual(res.data["body"]["id"], data["id"])
        self.assertEqual(res.data["body"]["name"], data["name"])
        self.assertEqual(res.data["body"]["is_active"], data["is_active"])
        self.assertEqual(res.data["body"]["daily_budget"], data["daily_budget"])
        self.assertEqual(res.data["body"]["max_bid"], data["max_bid"])
        self.assertEqual(res.status_code, 200)


class TestGetCampaign(APITestCase):
    """
    this testcase is used to test GET request that fetches all campaigns
    """

    def setUp(self):
        self.test_campaigns = Campaign.objects.values_list("name", flat=True)

    def test_get_all_campaigns(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT OF CAMPAIGNS: COUNT (INT)
            CAMPAIGNS: NAME (STRING)
        """
        url = "/ads/campaigns/"
        res = client.get(url)
        for campaign in res.data["body"]["results"]:
            self.assertIn(campaign["name"], self.test_campaigns)
        self.assertGreater(len(res.data["body"]), 0)
        self.assertEqual(res.status_code, 200)


class TestDeleteCampaign(APITestCase):
    """
    this testcase is used to test DELETE request for deleting a campaign
    """

    def setUp(self):
        self.campaign = Campaign.objects.first()

    def test_delete_campaign(self):
        """
        Method:
            DELETE

        Query_String:
            CAMPAIGN_ID: ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/ads/campaigns/{0}/".format(self.campaign.id)
        res = client.delete(url)
        self.assertEqual(res.data["body"]["Msg"], "Campaign deleted successfully")
        self.assertEqual(res.status_code, 200)


class TestGetGroupTypes(APITestCase):
    """
    this testcase is used to test GET request that fetches all Adgroups and AdTypes
    """

    def setUp(self):
        self.test_ad_type = AdType.objects.values_list("type", flat=True)
        self.adgroup = AdGroup.objects.last()
        self.test_adgroup_category = self.adgroup.category.values_list(
            "name", flat=True
        )

    def test_get_all_grouptypes(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT OF ADGROUPS: COUNT (INT)
            TYPE OF AD: TYPE (STRING)
            ADGROUP_CATEGORY: NAME (STRING)
            ADGROUP_CAMPAIGN_ID: ID (INT)
            ADGROUP_CAMPAIGN_NAME: NAME (INT)
            ADGROUP_CAMPAIGN_IS_ACTIVE: (BOOLEAN)
        """
        url = "/ads/grouptypes/"
        res = client.get(url)
        for adtype in res.data["body"]["types"]:
            self.assertIn(adtype["type"], self.test_ad_type)
        for cat in res.data["body"]["groups"][0]["category"]:
            self.assertIn(cat["name"], self.test_adgroup_category)
        self.assertEqual(
            self.adgroup.campaign.id, res.data["body"]["groups"][0]["campaign"]["id"]
        )
        self.assertEqual(
            self.adgroup.campaign.name,
            res.data["body"]["groups"][0]["campaign"]["name"],
        )
        self.assertEqual(
            self.adgroup.campaign.is_active, res.data["body"]["groups"][0]["is_active"]
        )
        self.assertGreater(len(res.data["body"]["groups"]), 0)
        self.assertGreater(len(res.data["body"]["types"]), 0)
        self.assertEqual(res.status_code, 200)


class TestActiveAds(APITestCase):
    """
    this testcase is used to test GET request to fetch Ads those are active
    """

    def setUp(self):
        self.test_active_ads = Advertisement.objects.values_list("ad_text", flat=True)

    def test_get_all_ads(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            ADVERTISEMENT_TEXT: NAME (STRING)
        """
        url = "/ads/schedules/"
        res = client.get(url)
        self.assertIn(res.data["body"]["ad_text"], self.test_active_ads)
        self.assertEqual(res.status_code, 200)


class TestFetchAllAdvertisement(APITestCase):
    """
    this testcase is used to test GET request to fetch all advertisements
    """

    def setUp(self):
        self.test_ads = Advertisement.objects.values_list("ad_text", flat=True)

    def test_get_advertisement(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT OF ADVERTISEMENTS: COUNT (STRING)
            ADVERTISEMENT_TEXT: NAME (STRING)
        """
        url = "/ads/advertisements/"
        res = client.get(url)
        for ads in res.data["body"]["results"]:
            self.assertIn(ads["ad_text"], self.test_ads)
        self.assertGreater(len(res.data["body"]), 0)
        self.assertEqual(res.status_code, 200)


class TestCreateAdvertisement(APITestCase):
    """
    this testcase is used to test POST request to create an advertisement
    """

    def setUp(self):
        self.adgroup = AdGroup.objects.first()
        self.adtype = AdType.objects.first()

    def test_post_advertisement_creation(self):
        """
        Method:
            POST

        POST Data:
            ADGROUP: ID (INT)
            ADTYPES: ID (INT)
            AD_TEXT: TEXT (STRING)
            AD_URL: URL (STRING)
            FILE: FILEPATH (STRING)
            IS_ACTIVE: (BOOLEAN)
            IMPSN_LIMIT: (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ADVERTISEMENT_ADGROUP: ID (INT)
            ADVERTISEMENT_ADTYPES: ID (INT)
            ADVERTISEMENT_AD_TEXT: TEXT (STRING)
            ADVERTISEMENT_AD_URL: URL (STRING)
            ADVERTISEMENT_IS_ACTIVE: (BOOLEAN)
            ADVERTISEMENT_IMPSN_LIMIT: (INT)
        """
        url = "/ads/advertisements/"
        data = {
            "adgroup": self.adgroup.id,
            "ad_type": self.adtype.id,
            "ad_text": "NewscoutApiTest",
            "ad_url": "http://newscout.in/",
            "file": "/home/rushikesh/Downloads/20191107_174950.jpg",
            "is_active": True,
            "impsn_limit": 99,
        }
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["adgroup"], data["adgroup"])
        self.assertEqual(res.data["body"]["ad_type"], data["ad_type"])
        self.assertEqual(res.data["body"]["ad_text"], data["ad_text"])
        self.assertEqual(res.data["body"]["ad_url"], data["ad_url"])
        self.assertEqual(res.data["body"]["is_active"], data["is_active"])
        self.assertEqual(res.data["body"]["impsn_limit"], data["impsn_limit"])
        self.assertEqual(res.status_code, 200)


class TestUpdateAdvertisement(APITestCase):
    """
    this testcase is used to test POST request to update an advertisement
    """

    def setUp(self):
        self.advertisement = Advertisement.objects.get(id=1)
        self.adgroup = AdGroup.objects.first()
        self.adtype = AdType.objects.first()

    def test_put_advertisement_update(self):
        """
        Method:
            POST

        POST Data:
            ADVERTISEMENT_ID: ID (INT)
            ADGROUP: ID (INT)
            ADTYPES: ID (INT)
            AD_TEXT: TEXT (STRING)
            AD_URL: URL (STRING)
            FILE: FILEPATH (STRING)
            IS_ACTIVE: (BOOLEAN)
            IMPSN_LIMIT: (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ADVERTISEMENT_ID: ID (INT)
            ADVERTISEMENT_ADGROUP: ID (INT)
            ADVERTISEMENT_ADTYPES: ID (INT)
            ADVERTISEMENT_AD_TEXT: TEXT (STRING)
            ADVERTISEMENT_AD_URL: URL (STRING)
            ADVERTISEMENT_IMPSN_LIMIT: (INT)
        """
        url = "/ads/advertisements/{0}/".format(self.advertisement.id)
        data = {
            "id": self.advertisement.id,
            "file": "/home/rushikesh/Downloads/20191107_174950.jpg",
            "adgroup": self.adgroup.id,
            "ad_type": self.adtype.id,
            "ad_text": "TestNewscout",
            "ad_url": "http://newscout.in/",
            "impsn_limit": 78,
        }
        res = client.put(url, data)
        self.assertNotEqual(res.data["body"]["ad_text"], self.advertisement.ad_text)
        self.assertNotEqual(
            res.data["body"]["impsn_limit"], self.advertisement.impsn_limit
        )
        self.assertEqual(res.data["body"]["id"], data["id"])
        self.assertEqual(res.data["body"]["adgroup"], data["adgroup"])
        self.assertEqual(res.data["body"]["ad_type"], data["ad_type"])
        self.assertEqual(res.data["body"]["ad_text"], data["ad_text"])
        self.assertEqual(res.data["body"]["ad_url"], data["ad_url"])
        self.assertEqual(res.data["body"]["impsn_limit"], data["impsn_limit"])
        self.assertEqual(res.status_code, 200)


class TestDeleteAdvertisement(APITestCase):
    """
    this testcase is used to test DELETE request for deleting an advertisement
    """

    def setUp(self):
        self.advertisement = Advertisement.objects.first()

    def test_delete_advertisement(self):
        """
        Method:
            DELETE

        Query_String:
            ADVERTISEMENT_ID: ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/ads/advertisements/{0}/".format(self.advertisement.id)
        res = client.delete(url)
        self.assertEqual(res.data["body"]["Msg"], "Advertisement deleted successfully")
        self.assertEqual(res.status_code, 200)


class TestGetAdGroup(APITestCase):
    """
    this testcase is used to test GET request to fetch all Adgroups
    """

    def setUp(self):
        self.adgroup = AdGroup.objects.last()

    def test_get_adgroup(self):
        """
        Method:
            GET

        Assert:
            RESPONSE_STATUS_CODE: 200
            COUNT OF ADGROUPS: COUNT (INT)
            ADGROUP_CAMPAIGN_ID: ID (INT)
            ADGROUP_CAMPAIGN_NAME: NAME (INT)
            ADGROUP_CAMPAIGN_IS_ACTIVE: (BOOLEAN)
        """
        url = "/ads/adgroups/"
        res = client.get(url)
        self.assertEqual(
            self.adgroup.campaign.id, res.data["body"]["results"][0]["campaign"]["id"]
        )
        self.assertEqual(
            self.adgroup.campaign.name,
            res.data["body"]["results"][0]["campaign"]["name"],
        )
        self.assertEqual(
            self.adgroup.campaign.is_active, res.data["body"]["results"][0]["is_active"]
        )
        self.assertGreater(len(res.data["body"]), 0)
        self.assertEqual(res.status_code, 200)


class TestCreateAdGroup(APITestCase):
    """
    this testcase is used to test POST request for creating a new adgroup
    """

    def setUp(self):
        self.campaign = Campaign.objects.first()
        self.test_first_category = Category.objects.first()
        self.test_second_category = Category.objects.last()

    def test_post_adgroup_creation(self):
        """
        Method:
            POST

        POST Data:
            CATEGORIES : IDS (LIST)
            CAMPAIGN : ID (INT)
            IS_ACTIVE: (BOOLEAN)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ADGROUP_CATEGORY_ID: ID (INT)
            ADGROUP_CAMPAIGN_ID: ID (INT)
            ADGROUP_CAMPAIGN_IS_ACTIVE: (BOOLEAN)
        """
        url = "/ads/adgroups/"
        data = {
            "campaign": self.campaign.id,
            "category": [self.test_first_category.id, self.test_second_category.id],
            "is_active": True,
        }
        res = client.post(url, data)
        for cat in res.data["body"]["category"]:
            self.assertIn(cat, data["category"])
        self.assertEqual(res.data["body"]["campaign"], data["campaign"])
        self.assertEqual(res.data["body"]["is_active"], data["is_active"])
        self.assertEqual(res.status_code, 200)


class TestUpdateAdGroup(APITestCase):
    """
    this testcase is used to test POST request for updating an adgroup
    """

    def setUp(self):
        self.adgroup = AdGroup.objects.first()
        self.campaign = Campaign.objects.first()
        self.test_first_category = Category.objects.first()

    def test_put_adgroup_update(self):
        """
        Method:
            PUT

        PUT Data:
            ADGROUP_ID: ID (INT)
            CATEGORIES : IDS (LIST)
            CAMPAIGN : ID (INT)
            IS_ACTIVE: (BOOLEAN)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ADGROUP_CAMPAIGN_ID: ID (INT)
            ADGROUP_CATEGORY_ID: ID (INT)
            ADGROUP_CAMPAIGN_IS_ACTIVE: (BOOLEAN)
        """
        url = "/ads/adgroups/{0}/".format(self.adgroup.id)
        data = {
            "id": self.adgroup.id,
            "campaign": self.campaign.id,
            "category": [self.test_first_category.id],
            "is_active": True,
        }
        res = client.put(url, data)
        for cat in res.data["body"]["category"]:
            self.assertIn(cat, data["category"])
        self.assertEqual(res.data["body"]["campaign"], data["campaign"])
        self.assertEqual(res.data["body"]["is_active"], data["is_active"])
        self.assertEqual(res.status_code, 200)


class TestDeleteAdGroup(APITestCase):
    """
    this testcase is used to test DELETE request for deleting an adgroup
    """

    def setUp(self):
        self.adgroup = AdGroup.objects.first()

    def test_delete_adgroup(self):
        """
        Method:
            DELETE

        Query_String:
            ADGROUP_ID: ID (INT)
        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE: MSG (STRING)
        """
        url = "/ads/adgroups/{0}/".format(self.adgroup.id)
        res = client.delete(url)
        self.assertEqual(res.data["body"]["Msg"], "AdGroup deleted successfully")
        self.assertEqual(res.status_code, 200)


class TestGetComment(APITestCase):
    """
    this testcase is used to test GET request to fetch all comments of an Article
    """

    def setUp(self):
        self.comment_id = []
        self.article = Article.objects.first()
        self.comment = Comment.objects.filter(article=self.article)
        for value in self.comment.values():
            self.comment_id.append(value["id"])
        self.article_like_count = ArticleLike.objects.filter(
            article=self.article
        ).count()

    def test_get_comments(self):
        """
        Method:
            GET

        Query String:
            ARTICLE_ID: ID (INT)

        Assert:
            RESPONSE ARTICLE ID (INT)
            RESPONSE COMMENT ID (INT)
            RESPONSE_STATUS_CODE: 200
            LIKE COUNT FOR THE PARTICULAR ARTICLE
        """
        url = "/api/v1/comment/?article_id={0}".format(self.article.id)
        res = client.get(url)
        for result in res.data["body"]["results"]:
            self.assertEqual(self.article.id, int(result["article_id"]))
            self.assertIn(result["id"], self.comment_id)
        self.assertEqual(
            res.data["body"]["total_article_likes"], self.article_like_count
        )
        self.assertEqual(res.status_code, 200)


class TestGetEmptyComment(APITestCase):
    """
    this testcase is used to test GET request of article having no comments but having a like
    """

    def setUp(self):
        self.article = Article.objects.last()
        self.comment = Comment.objects.filter(article=self.article)
        self.article_like_count = ArticleLike.objects.filter(
            article=self.article
        ).count()

    def test_get_empty_comments(self):
        """
        Method:
            GET

        Query String:
            ARTICLE_ID: ID (INT)

        Assert:
            EMPTY RESPONSE
            RESPONSE_STATUS_CODE: 200
            LIKE COUNT FOR THE PARTICULAR ARTICLE
        """
        url = "/api/v1/comment/?article_id={0}".format(self.article.id)
        res = client.get(url)
        self.assertEqual(res.data["body"]["results"], [])
        self.assertEqual(
            res.data["body"]["total_article_likes"], self.article_like_count
        )
        self.assertEqual(res.status_code, 200)


class TestGetErrorComment(APITestCase):
    """
    this testcase is used to test GET request when no or invalid article id is entered
    """

    def test_get_error_comments(self):
        """
        Method:
            GET

        Query String:
            NO ARTICLE_ID: ID (INT)

        Assert:
            ERROR RESPONSE
            RESPONSE_STATUS_CODE: 200
        """
        url = "/api/v1/comment/?article_id="
        res = client.get(url)
        self.assertEqual(
            res.data["errors"]["error"], "Article ID has not been entered by the user"
        )
        self.assertEqual(res.status_code, 200)

    def test_get_error_id_comments(self):
        """
        Method:
            GET

        Query String:
            INVALID ARTICLE_ID: ID (INT)

        Assert:
            ERROR RESPONSE
            RESPONSE_STATUS_CODE: 200
        """
        url = "/api/v1/comment/?article_id=0"
        res = client.get(url)
        self.assertEqual(res.data["errors"]["error"], "Article does not exist")
        self.assertEqual(res.status_code, 200)


class TestCreateComment(APITestCase):
    """
    this testcase is used to test POST request to create a comment
    """

    def setUp(self):
        self.article = Article.objects.last()

    def test_post_comment(self):
        """
        Method:
            POST

        POST Data:
            ARTICLE_ID : ID (INT)
            COMMENT: (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            COMMENT: (STRING)
            ARTICLE_ID: ID (INT)
            USER_ID: (BOOLEAN)
        """
        url = "/api/v1/comment/"
        data = {"article_id": self.article.id, "comment": "New Test Comment"}
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["result"]["comment"], data["comment"])
        self.assertEqual(
            int(res.data["body"]["result"]["article_id"]), data["article_id"]
        )
        self.assertEqual(res.data["body"]["result"]["user"], user.id)
        self.assertEqual(res.status_code, 200)


class TestErrorCreateComment(APITestCase):
    """
    this testcase is used to test POST request to create a comment
    """

    def setUp(self):
        self.article = Article.objects.last()

    def test_post_comment(self):
        """
        Method:
            POST

        POST Data:
            ARTICLE_ID : ID (INT)
            NO COMMENT: (STRING)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE : (STRING)
        """
        url = "/api/v1/comment/"
        data = {
            "article_id": self.article.id,
        }
        res = client.post(url, data)
        self.assertEqual(res.data["errors"]["error"], "Enter Valid data")
        self.assertEqual(res.status_code, 200)


class TestCreateReply(APITestCase):
    """
    this testcase is used to test POST request to create a reply to a comment
    """

    def setUp(self):
        self.article = Article.objects.first()
        self.comment = Comment.objects.first()

    def test_post_reply(self):
        """
        Method:
            POST

        POST Data:
            ARTICLE_ID : ID (INT)
            COMMENT: (STRING)
            REPLY : ID (INT) (FOREIGN KEY)

        Assert:
            RESPONSE_STATUS_CODE: 200
            COMMENT: (STRING)
            ARTICLE_ID: ID (INT)
            USER_ID: (BOOLEAN)
            REPLY : ID (INT) (FOREIGN KEY)
        """
        url = "/api/v1/comment/"
        data = {"article_id": self.article.id, "comment": "New Test Comment", "reply": self.comment.id}
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["result"]["comment"], data["comment"])
        self.assertEqual(
            int(res.data["body"]["result"]["article_id"]), data["article_id"]
        )
        self.assertEqual(res.data["body"]["result"]["user"], user.id)
        self.assertEqual(res.data["body"]["result"]["reply"], data["reply"])
        self.assertEqual(res.status_code, 200)


class TestErrorCreateReply(APITestCase):
    """
    this testcase is used to test POST request to test error while creating a reply to a comment
    """

    def setUp(self):
        self.article = Article.objects.last()
        self.comment = Comment.objects.first()

    def test_error_post_reply(self):
        """
        Method:
            POST

        POST Data:
            INAVLID ARTICLE_ID : ID (INT)
            COMMENT: (STRING)
            REPLY : ID (INT) (FOREIGN KEY)

        Assert:
            RESPONSE_STATUS_CODE: 200
            ERROR_RESPONSE_MESSAGE: (STRING)
        """
        url = "/api/v1/comment/"
        data = {"article_id": self.article.id, "comment": "New Test Comment", "reply": self.comment.id}
        res = client.post(url, data)
        self.assertEqual(res.data["errors"]["Msg"][0], "Replying on wrong article")
        self.assertEqual(res.status_code, 401)


class TestLikeArticle(APITestCase):
    """
    this testcase is used to test POST request to like an article
    """

    def setUp(self):
        self.article = Article.objects.last()

    def test_like_article(self):
        """
        Method:
            POST

        POST Data:
            ARTICLE_ID : ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE : (STRING)
        """
        url = "/api/v1/article-like/"
        data = {
            "article": self.article.id,
        }
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["Msg"], "Liked")
        self.assertEqual(res.status_code, 200)


class TestRemoveLikeArticle(APITestCase):
    """
    this testcase is used to test POST request to remove like on an article
    """

    def setUp(self):
        self.article = Article.objects.last()
        ArticleLike.objects.create(article=self.article, user=user)

    def test_remove_like_article(self):
        """
        Method:
            POST

        POST Data:
            ARTICLE_ID : ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE : (STRING)
        """
        url = "/api/v1/article-like/"
        data = {
            "article": self.article.id,
        }
        res = client.post(url, data)
        self.assertEqual(res.data["body"]["Msg"], "Removed Like")
        self.assertEqual(res.status_code, 200)


class TestErrorLikeArticle(APITestCase):
    """
    this testcase is used to test POST request to display error for invalid data
    """

    def test_remove_like_article(self):
        """
        Method:
            POST

        POST Data:
            INVALID ARTICLE_ID : ID (INT)

        Assert:
            RESPONSE_STATUS_CODE: 200
            RESPONSE_MESSAGE : (STRING)
        """
        url = "/api/v1/article-like/"
        data = {
            "article": 0,
        }
        res = client.post(url, data)
        self.assertEqual(res.data["errors"]["error"], "Invalid Data Entered")
        self.assertEqual(res.status_code, 200)
