import operator
from hashlib import md5
from collections import defaultdict


from django.core.management.base import BaseCommand

from api.v1.serializers import ArticleSerializer

from core.utils import create_index, ingest_to_elastic, get_docs, search_index

from core.models import Article, Domain, Category, Source, sample

auto_suggestion_mapping = {
    "mappings": {
        "desc": {
            "properties": {
                "desc": {"type": "text"},
                "name_suggest": {
                    "type": "completion",
                    "analyzer": "standard",
                    "search_analyzer": "standard",
                },
            }
        }
    }
}


class IngestArticle(BaseCommand):
    batch = []

    def get_tags(self, tags):
        """
        this method will return tag name from tags objects
        """
        tag_list = []
        for tag in tags:
            tag_list.append(tag["name"])
        return tag_list

    def ingest(self, *args, **options):
        print("Ingesting Data from Database\n")
        index = "article"
        create_index(index)
        for article in Article.objects.all().iterator():
            serializer = ArticleSerializer(article)
            json_data = serializer.data
            if json_data["hash_tags"]:
                tag_list = self.get_tags(json_data["hash_tags"])
                json_data["hash_tags"] = tag_list
            self.batch.append(json_data)
            if len(self.batch) == 999:
                ingest_to_elastic(self.batch, index, index, "id")
                self.batch = []
                print("Ingesting Batch...!!!")
        ingest_to_elastic(self.batch, index, index, "id")
        print("Ingesting Final Batch...!!!")


class IngestSuggestions(BaseCommand):
    batch = []

    def ingest(self, *args, **options):
        print("Ingesting Data from Database\n")
        index = "auto_suggestions"
        create_index(index, auto_suggestion_mapping)

        for domain in Domain.objects.filter(domain_name__isnull=False).iterator():
            if domain.domain_name:
                as_dict = {}
                as_dict["desc"] = domain.domain_name
                as_dict["name_suggest"] = domain.domain_name
                as_dict["id"] = md5(str(domain.domain_name).encode("utf-8")).hexdigest()
                self.batch.append(as_dict)
                if len(self.batch) == 999:
                    ingest_to_elastic(self.batch, index, index, "id")
                    self.batch = []
                    print("Ingesting Batch...!!!")
        print("Done ingesting domains")

        for source in Source.objects.filter(name__isnull=False).iterator():
            if source.name:
                as_dict = {}
                as_dict["desc"] = source.name
                as_dict["name_suggest"] = source.name
                as_dict["id"] = md5(str(source.name).encode("utf-8")).hexdigest()
                self.batch.append(as_dict)
                if len(self.batch) == 999:
                    ingest_to_elastic(self.batch, index, index, "id")
                    self.batch = []
                    print("Ingesting Batch...!!!")
        print("Done ingesting sources")

        for cat in Category.objects.filter(name__isnull=False).iterator():
            if cat.name:
                as_dict = {}
                as_dict["desc"] = cat.name
                as_dict["name_suggest"] = cat.name
                as_dict["id"] = md5(str(cat.name).encode("utf-8")).hexdigest()
                self.batch.append(as_dict)
                if len(self.batch) == 999:
                    ingest_to_elastic(self.batch, index, index, "id")
                    self.batch = []
                    print("Ingesting Batch...!!!")
        ingest_to_elastic(self.batch, index, index, "id")
        print("Done ingesting categories")

        results = sample(Article, 500)
        counts = defaultdict(int)

        for current in results:
            article = Article.objects.get(id=current)
            for entity in article.entities():
                token, label = entity
                counts[token] += 1

        n = 0
        processed = []
        for k, v in counts.items():
            if v > 1 and k[0].isupper() and k not in processed:
                as_dict = {}
                as_dict["desc"] = k
                as_dict["name_suggest"] = k
                as_dict["id"] = md5(str(k).encode("utf-8")).hexdigest()
                self.batch.append(as_dict)
                if len(self.batch) == 999:
                    ingest_to_elastic(self.batch, index, index, "id")
                    self.batch = []
                    print("Ingesting Batch...!!!")
                n += 1
        ingest_to_elastic(self.batch, index, index, "id")
        print(f"Generated {n} suggestions")
        print("Ingesting Final Batch...!!!")


class RelatedQueries(BaseCommand):
    batch = []

    def ingest(self, *args, **options):
        index = "related_queries"
        create_index(index, auto_suggestion_mapping)
        print("Generating related queries")
        _, total = get_docs("auto_suggestions")
        i = 0
        INCR = 25
        while i < total:
            results, _ = get_docs("auto_suggestions", i, i + INCR)
            for current in results:
                counts = defaultdict(int)
                if current.strip() != "" and current[0].isupper():
                    article_ids, _ = search_index(
                        {"match": {"blurb": current}}, "article", ["id"]
                    )
                    for candidate in article_ids:
                        if Article.objects.filter(id=candidate["id"]).exists():
                            article = Article.objects.get(id=candidate["id"])
                            entities = article.entities()
                            for suggestion in entities:
                                k, v = suggestion
                                if k != current and k.strip() != "" and k[0].isupper():
                                    counts[k.strip()] += 1

                    final_batch = {}
                    final_results = []
                    for k, v in counts.items():
                        if v > 1:
                            final_batch[k] = v
                    if len(final_batch) > 0:
                        sorted_batch = sorted(
                            final_batch.items(),
                            key=operator.itemgetter(1),
                            reverse=True,
                        )
                        for final_item in sorted_batch[: min(25, len(sorted_batch))]:
                            suggestion, _ = final_item
                            final_results.append(suggestion)

                    if len(final_results) > 0:
                        doc = {}
                        doc["id"] = md5(str(current).encode("utf-8")).hexdigest()
                        doc["q"] = current
                        doc["suggestions"] = final_results
                        ingest_to_elastic([doc], index, index, "id")
                        print(f"Done for:{current}")
            i += INCR


def make_a_choice():
    # Show Options
    choices = [
        "1. Ingest articles",
        "2. Ingest auto suggestions",
        "3. Ingest related-query suggestions",
        "4. Exit",
    ]
    choices_count = len(choices)
    print("\n".join(choices))

    # Get input ###
    # Wait for valid input in while...not ###
    is_valid = 0

    while not is_valid:
        try:
            choice = int(input("Enter your choice [1-{0}] : ".format(choices_count)))
            if choice in range(1, choices_count + 1):
                is_valid = 1
                """set it to 1 to validate input and to terminate the
                while..not loop"""
        except ValueError as e:
            print("'%s' is not a valid integer." % e.args[0].split(": ")[1])

    # Take action as per selected menu-option ###
    if choice == 1:
        ingest_article = IngestArticle()
        ingest_article.ingest()
    elif choice == 2:
        auto_suggestion = IngestSuggestions()
        auto_suggestion.ingest()
    elif choice == 3:
        related_queries = RelatedQueries()
        related_queries.ingest()
    else:
        print("Bye!")
        exit()


class Command(BaseCommand):
    help = "This command is used to ingest data from \
        database to elastic search"

    def handle(self, *args, **options):
        make_a_choice()
