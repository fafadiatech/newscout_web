from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

client = APIClient()
user = User.objects.get(username="rushikesh@fafadiatech.com")
client.force_authenticate(user=user)


class TestAllArticlesOpen(APITestCase):
    """
    this testcase is use to test GET request that fetches
    """

    def test_get_open_article(self):
        """
        METHOD:
            GET
        ASSERT:
            RESPONSE_STATUS_CODE: 200
            AVERAGE COUNT
            COUNT OF DATA
            MAXIMUM VALUE OF COUNT    
        """
        total = 0
        count = 0
        numbers = []
        url = "/analytics/all-articles-open/"
        res = client.get(url)
        for x in res.data["body"]["result"]["data"]:
            total += x["count"]
            numbers.append(x["count"])
            count += 1
        self.assertEqual(round(res.data["body"]["avg_count"]), round(total / count))
        self.assertGreater(len(res.data["body"]["result"]), 0)
        self.assertEqual(
            res.data["body"]["result"]["max"]["count"], sorted(numbers)[-1]
        )
        self.assertEqual(res.status_code, 200)


class TestArticlesPerPlatform(APITestCase):
    """
    this testcase is use to test GET request that fetches articles per platform
    """

    def test_get_articles_per_platform(self):
        """
        METHOD:
            GET
        ASSERT:
            RESPONSE_STATUS_CODE: 200
            COUNT OF DATA 
        """
        total = 0
        url = "/analytics/articles-per-platform/"
        res = client.get(url)
        self.assertGreater(len(res.data["body"]["result"]), 0)
        self.assertEqual(res.status_code, 200)


class TestArticlesPerCategory(APITestCase):
    """
    this testcase is use to test GET request that fetches articles per category
    """

    def test_get_articles_per_category(self):
        """
        METHOD:
            GET
        ASSERT:
            RESPONSE_STATUS_CODE: 200
            AVERAGE COUNT
            COUNT OF DATA 
        """
        total = 0
        count = 0
        url = "/analytics/articles-per-category/"
        res = client.get(url)
        for x in res.data["body"]["result"]:
            total += x["count"]
            count += 1
        self.assertEqual(round(res.data["body"]["avg_count"]), round(total / count))
        self.assertGreater(len(res.data["body"]["result"]), 0)
        self.assertEqual(res.status_code, 200)


class TestInteractionPerCategory(APITestCase):
    """
    this testcase is use to test GET request that fetches interactions per category
    """

    def test_get_interaction_per_category(self):
        """
        METHOD:
            GET
        ASSERT:
            RESPONSE_STATUS_CODE: 200
            AVERAGE COUNT
            COUNT OF DATA 
        """
        total = 0
        count = 0
        url = "/analytics/interactions-per-category/"
        res = client.get(url)
        for x in res.data["body"]["result"]:
            total += x["total_interactions"]
            count += 1
        self.assertEqual(round(res.data["body"]["avg_count"]), round(total / count))
        self.assertGreater(len(res.data["body"]["result"]), 0)
        self.assertEqual(res.status_code, 200)


class TestArticlesPerAuthor(APITestCase):
    """
    this testcase is use to test GET request that fetches articles per author
    """

    def test_get_articles_per_author(self):
        """
        METHOD:
            GET
        ASSERT:
            RESPONSE_STATUS_CODE: 200
            AVERAGE COUNT
            COUNT OF DATA 
        """
        total = 0
        count = 0
        url = "/analytics/articles-per-author/"
        res = client.get(url)
        for x in res.data["body"]["result"]:
            total += x["article_count"]
            count += 1
        self.assertEqual(round(res.data["body"]["avg_count"]), round(total / count))
        self.assertGreater(len(res.data["body"]["result"]), 0)
        self.assertEqual(res.status_code, 200)


class TestInteractionPerAuthor(APITestCase):
    """
    this testcase is use to test GET request that fetches interactionsper author
    """

    def test_get_interaction_per_author(self):
        """
        METHOD:
            GET
        ASSERT:
            RESPONSE_STATUS_CODE: 200
            AVERAGE COUNT
            COUNT OF DATA 
        """
        total = 0
        count = 0
        url = "/analytics/interactions-per-author/"
        res = client.get(url)
        for x in res.data["body"]["result"]:
            total += x["article_detail"]
            count += 1
            total += x["article_search_details"]
            count += 1
        self.assertEqual(round(total / count), round(res.data["body"]["avg_count"]))
        self.assertGreater(len(res.data["body"]["result"]), 0)
        self.assertEqual(res.status_code, 200)


class TestArticlesPerSession(APITestCase):
    """
    this testcase is use to test GET request that fetches articles per session
    """

    def test_get_articles_per_session(self):
        """
        METHOD:
            GET
        ASSERT:
            RESPONSE_STATUS_CODE: 200
            AVERAGE COUNT
            COUNT OF DATA 
        """
        total = 0
        count = 0
        url = "/analytics/aticles-per-session/"
        res = client.get(url)
        for x in res.data["body"]["result"]["data"]:
            total += x["avg_count"]
            count += 1
        self.assertEqual(round(total / count), round(res.data["body"]["avg_count"]))
        self.assertGreater(len(res.data["body"]["result"]["data"]), 0)
        self.assertEqual(res.status_code, 200)


class TestInteractionsPerSession(APITestCase):
    """
    this testcase is use to test GET request that fetches interactions per session
    """

    def test_get_interaction_per_session(self):
        """
        METHOD:
            GET
        ASSERT:
            RESPONSE_STATUS_CODE: 200
            AVERAGE COUNT
            COUNT OF DATA 
        """
        total = 0
        count = 0
        url = "/analytics/interactions-per-session/"
        res = client.get(url)
        for x in res.data["body"]["result"]:
            total += x["avg_count"]
            count += 1
        self.assertEqual(round(total / count), round(res.data["body"]["avg_count"]))
        self.assertGreater(len(res.data["body"]["result"]), 0)
        self.assertEqual(res.status_code, 200)
