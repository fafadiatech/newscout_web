
from dateutil.parser import parse
from datetime import datetime
def parse_date(date_str):
    try:
        dt = parse(date_str)
        return dt.astimezone(tz=pytz.UTC)
    except Exception:
        try:
            ts = int(date_str)
            return datetime.utcfromtimestamp(ts)
        except Exception:
            return datetime.now()

domain, _ = Domain.objects.get_or_create(id=7)
source, _ = Source.objects.get_or_create(name="analyticsindiamag.com")
count = 0
for i in data:
    title = i.get("title", "")
    category = i.get("category", "")
    if not category:
        continue
    category_obj, _ = Category.objects.get_or_create(name=category)
    source_url = i.get("source_url", "")
    cover_image = i.get("cover_image", "")
    blurb = i.get("blurb", "")
    full_text = i.get("full_text", "")
    published_on = parse_date(i.get("published_on", ""))
    active = True
    a_obj = Article.objects.create(
        title=title,
        domain=domain,
        source=source,
        category=category_obj,
        source_url=source_url,
        cover_image=cover_image,
        blurb=blurb,
        full_text=full_text,
        published_on=published_on,
        active=active
    )
    if len(i["images"]) > 1:
        for i in i["images"]:
            ArticleMedia.objects.create(
                article=a_obj,
                category="image",
                url=i
            )
    count += 1
    print(count)

batch = []
from api.v1.serializers import ArticleSerializer
a = Article.objects.filter(domain=domain)
for i in a:
    serializer = ArticleSerializer(i)
    json_data = serializer.data
    batch.append(json_data)
    if len(batch) == 999:
        ingest_to_elastic(batch, 'article', 'article', 'id')
        batch = []
ingest_to_elastic(batch, 'article', 'article', 'id')


import os
import cPickle
import zlib

data = []
count = 0
for root, dirs, files in os.walk("/home/tensor/Code/scrapy-ft-news-sites/news_crawl/crawl_data/fortuneindia.com"):
    if files:
        for f in files:
            file_path = "{0}/{1}".format(root, f)
            count += 1
            doc = cPickle.loads(zlib.decompress(open(file_path).read()))
            # cat = doc["category"]
            # if len(cat) == 1:
            #     doc["category"] = cat[0]
            # else:
            #     doc["category"] = cat[1]
            data.append(doc)
            print(count)
            print(file_path)