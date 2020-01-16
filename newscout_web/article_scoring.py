from __future__ import division
import numpy
import datetime
from core.utils import es
from django.utils import timezone


class ArticleScore(object):
    """
    this class is used to calculate custom score for given article
    based on various parametres
    """

    def softmax(self, w, t=1.0):
        """
        Calculate the softmax of a list of numbers w.
        """
        e = numpy.exp(numpy.array(w) / t)
        dist = e / numpy.sum(e)
        return dist

    def get_date_range(self, days=2):
        """
        this method is used to get start date and end date for article filter
        """
        end_date = timezone.now().date()
        start_date = end_date - timezone.timedelta(days=days)
        start_date = datetime.datetime.combine(start_date, datetime.time.min)
        end_date = datetime.datetime.combine(end_date, datetime.time.max)
        return start_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ"), end_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

    def get_cover_image_score(self, doc):
        """
        this method is used to calculate score for article cover image and total images
        """
        score = 10
        if not doc["cover_image"]:
            return 0
        if doc["images"]:
            score = score + len(doc["images"])
        return score + 1

    def get_diversity_score(self, doc):
        """
        this method is used to calculate score based on similar article count
        in last 48 hours
        """
        default_score = 23.3
        title = doc["title"]
        start, end = self.get_date_range()
        results = es.search(
            index='article',
            body={
                "query": {
                    "bool": {
                        "must": [
                            { "multi_match": {"query": title, "fields": ["title", "blurb^3"] }},
                            ],
                        "filter": [
                            {"range" : {"published_on" : {"gt": start,"lt": end}}}
                            ]
                        }
                    }
                }
            )

        if not results["hits"]["hits"]:
            return results, default_score

        min_query_score = int(results["hits"]["max_score"] * 0.8)

        new_results = es.search(
            index='article',
            body={
                "min_score": min_query_score,
                "query": {
                    "bool": {
                        "must": [
                            { "multi_match": {"query": title, "fields": ["title", "blurb^3"] }},
                            ],
                        "filter": [
                            {"range" : {"published_on" : {"gt": start,"lt": end}}}
                            ]
                        }
                    }
                }
            )

        if len(new_results["hits"]["hits"]) == 0:
            return results, default_score

        final_score = default_score * (1 / len(new_results["hits"]["hits"]))

        return results, round(final_score, 2)

    def get_diversity_uniqueness_score(self, doc):
        """
        this method is used to calculate uniqueness score for given article
        """
        default_score = 23.3
        results, diversity_score = self.get_diversity_score(doc)

        if not results["hits"]["hits"]:
            return diversity_score, default_score

        scores_list = [i["_score"] for i in results["hits"]["hits"]]
        softmax_array = list(self.softmax(scores_list))

        final_score = default_score * (1 - softmax_array[0])

        return diversity_score, round(final_score, 2)

    def get_content_score(self):
        """
        this method is used to calculate score based on article content
        """
        default_score = 23.3

        return default_score

    def get_performace_score(self):
        """
        this method is used to calculate score based on article url latency
        """
        default_score = 10

        return default_score

    def get_bounce_score(self):
        """
        this method is used to calculate score based on article bounce rate
        """
        default_score = 10

        return default_score

    def calculate_score(self, doc):
        """
        this method is used to calculate final article score
        based on
        cover image, diversity, uniqeness, content, performance and bounce score
        """
        diversity_score, uniqueness_score = self.get_diversity_uniqueness_score(doc)
        final_score = sum([
            self.get_cover_image_score(doc),
            diversity_score,
            uniqueness_score,
            self.get_content_score(),
            self.get_performace_score(),
            self.get_bounce_score()
        ])

        return round(final_score, 2)
