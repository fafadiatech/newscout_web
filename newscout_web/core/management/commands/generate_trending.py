import os
import string
import datetime

from operator import itemgetter
from datasketch import MinHash
from core.utils import es
from core.models import Article, TrendingArticle, Domain
from django.conf import settings
from django.utils import timezone
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'This command is used to generate data for trending section'

    batch = []
    titles = {}
    stopwords = [current.strip() for current in open(os.path.join(settings.BASE_DIR, "news_site", "management", "commands", "stopwords.txt")).readlines()]
    epoch = 3
    MAX_TRENDING = 30

    def add_arguments(self, parser):
        parser.add_argument('--domain', '-d', nargs='+', type=str)

    def strip_puncs(self, s):
        table = str.maketrans({key: None for key in string.punctuation})
        return s.translate(table)

    def get_date_range(self, days=3):
        """
        this method is used to get start date and end date for article filter
        """
        end_date = timezone.now().date()
        start_date = end_date - timezone.timedelta(days=days)
        start_date = datetime.datetime.combine(start_date, datetime.time.min)
        end_date = datetime.datetime.combine(end_date, datetime.time.max)
        return start_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ"), end_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

    def get_query(self, index, domain, size):
        start, end = self.get_date_range(self.epoch)
        return es.search(
                    index=index,
                    body={
                    "query": {
                        "bool": {
                            "must": [
                                {
                                "term": {"domain": domain}
                                },
                                {"range": {
                                    "published_on": {
                                        "from": start,
                                        "to": end
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "size": size
                })

    def get_min_hash(self, title, blurb):
        """
        this method generates min hash
        """
        signature = MinHash()
        filter_stopwords = lambda x: x not in self.stopwords
        contents = self.strip_puncs(title.lower() + " " + blurb.lower()).split()
        cleaned_contents = set(list(filter(filter_stopwords, contents)))

        for current in cleaned_contents:
            signature.update(current.encode('utf-8'))
        return signature

    def has_overlap(self, a, b):
        """
        this method is used to check if there is overlap of tokens
        between titles
        """
        filter_stopwords = lambda x: x not in self.stopwords
        for index_a in a:
            for index_b in b:
                contents_a = self.strip_puncs(self.titles[int(index_a)])
                contents_b = self.strip_puncs(self.titles[int(index_b)])

                contents_a = set(filter(filter_stopwords, contents_a.lower().split()))
                contents_b = set(filter(filter_stopwords, contents_b.lower().split()))

                if len(list(contents_a.intersection(contents_b))) != 0:
                    return (len(list(contents_a.intersection(contents_b))) / float(len(list(contents_a.union(contents_b))))) > 0.10
        return False

    def handle(self, *args, **options):
        domains = options["domain"]
        if not domains:
            raise CommandError('Domain name is required')

        for domain in Domain.objects.filter(domain_id__in=domains):
            old_objects = TrendingArticle.objects.filter(domain=domain)
            if old_objects:
                start = old_objects.first().id
                end = old_objects.last().id
            index = "article"
            size = 10
            response = self.get_query(index, domain.domain_id, size)

            size = response["hits"]["total"]

            if size > 0:
                response = self.get_query(index, domain.domain_id, size)

                for i in response["hits"]["hits"]:
                    self.batch.append(i["_source"])

            signatures = {}


            for current in self.batch:
                self.titles[current['id']] = current['title']
                signatures[current['id']] = self.get_min_hash(current['title'], current['blurb'])

            final_scores = {}
            uniq_ids = []
            cluster_mappings = {}
            clusters = []

            for a in signatures:
                for b in signatures:
                    if a != b:
                        score = signatures[a].jaccard(signatures[b])
                        if score > 0.2:
                            if a not in uniq_ids:
                                uniq_ids.append(a)

                            if b not in uniq_ids:
                                uniq_ids.append(b)

                            key = [str(a), str(b)]
                            key.sort()
                            key = "\t".join(key)
                            final_scores[key] = score

            print("Total uniq ids {}".format(len(uniq_ids)))

            for k, _ in final_scores.items():
                a, b = k.split("\t")
                if a not in cluster_mappings and b not in cluster_mappings:
                    cluster_id = 0

                    if len(clusters) > 0:
                        cluster_id = len(clusters)
                    cluster_mappings[a] = cluster_id
                    cluster_mappings[b] = cluster_id
                    clusters.append([a, b])
                elif a not in cluster_mappings and b in cluster_mappings:
                    cluster_mappings[a] = cluster_mappings[b]
                    clusters[cluster_mappings[b]].append(a)
                elif a in cluster_mappings and b not in cluster_mappings:
                    cluster_mappings[b] = cluster_mappings[a]
                    clusters[cluster_mappings[a]].append(b)
                else:
                    continue

            # final level of clustering
            final_clusters = []
            processed_clusters = []
            for i in range(len(clusters)):

                if i in processed_clusters:
                    continue

                matched = False
                matched_index = 0

                for j in range(i, len(clusters)):
                    if i != j:
                        matched = self.has_overlap(clusters[i], clusters[j])

                        if matched:
                            matched_index = j
                            break

                if not matched:
                    final_clusters.append(clusters[i])
                else:
                    final_clusters.append(list(set(clusters[i] + clusters[matched_index])))
                    processed_clusters.append(matched_index)

            cluster_id_to_ts = []
            for i, group in enumerate(final_clusters):
                ts = None
                for item in group:
                    item_id = int(item)
                    if Article.objects.filter(id=item_id).exists():
                        member = Article.objects.get(id=item_id)
                        if ts is None:
                            ts = member.published_on
                            continue
                        if member.published_on < ts:
                            ts = member.published_on
                cluster_id_to_ts.append((i, ts))

            sorted_cluster_id_to_ts = sorted(cluster_id_to_ts, key=itemgetter(1), reverse=True)

            n = 0
            all_articles_in_trending = []
            for item in sorted_cluster_id_to_ts:
                i, ts = item
                group = final_clusters[i]
                print("Cluster {}:".format(i+1))
                trending = TrendingArticle(domain=domain)
                trending.save()
                article_sources = []
                for item in group:
                    item_id = int(item)
                    if item_id not in all_articles_in_trending:
                        print("\t", self.titles[item_id])
                        if Article.objects.filter(id=item_id).exists():
                            member = Article.objects.get(id=item_id)
                            if member.source.name not in article_sources:
                                trending.articles.add(member)
                                trending.save()
                                article_sources.append(member.source.name)

                if trending.articles.count() <= 1:
                    trending.delete()
                else:
                    n += 1
                    if n >= self.MAX_TRENDING:
                        break

            print("Removing old trending objects")
            if old_objects:
                old_objects_ids = list(range(start, end+1))
                TrendingArticle.objects.filter(id__in=old_objects_ids).delete()
            self.batch = []
            self.titles = {}
