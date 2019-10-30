import os
import sys
import json
import base64
import smtplib
from email import encoders
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from django.utils.timezone import now
from django.conf import settings
from datetime import timedelta

from django.db.models import Count
from django.core.management.base import BaseCommand

from core.models import Article, Category

EMAIL_FROM = ''
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_PASSWORD = ''
MAILING_LIST = []

DATA_DIR = os.path.join(settings.BASE_DIR, "news_site", "static", "js", "react")


def send_mail(text, FILES_TO_ATTACH):
    today = now()

    outer = MIMEMultipart()
    outer['Subject'] = 'NewScout Analytics report for ' + today.strftime("%d, %b %Y")
    outer['To'] = ",".join(MAILING_LIST)
    outer['From'] = EMAIL_FROM
    outer.attach(MIMEText(text, 'plain'))

    # Add the attachments to the message
    for file in FILES_TO_ATTACH:
        try:
            with open(file, 'rb') as fp:
                msg = MIMEBase('application', "octet-stream")
                msg.set_payload(fp.read())
            encoders.encode_base64(msg)
            msg.add_header('Content-Disposition', 'attachment', filename=os.path.basename(file))
            outer.attach(msg)
        except:
            print("Unable to open one of the attachments. Error: ", sys.exc_info()[0])
            raise

    composed = outer.as_string()
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as s:
            s.ehlo()
            s.starttls()
            s.ehlo()
            s.login(EMAIL_FROM, SMTP_PASSWORD)
            s.sendmail(EMAIL_FROM, MAILING_LIST, composed)
            s.close()
        print("Email sent!")
    except:
        print("Unable to send the email. Error: ", sys.exc_info()[0])
        raise

class Command(BaseCommand):
    help = 'This command is used to generate daily analytics data'

    uncategorized = Category.objects.get(name='Uncategorised')

    def dump_json(self, output_name, data):
        """
        this method is used to save dictionaries into JSON
        files
        """
        file_to_save = open(os.path.join(DATA_DIR, output_name), "w")
        file_to_save.write(json.dumps(data))

    def get_source_counts(self,categorized=False):
        """
        this method is used to get total articles
        which are un-categorized by source
        """
        if not categorized:
            return Article.objects.filter(category=self.uncategorized).values('source__name').annotate(total=Count('source__name')).order_by('-total')
        else:
            return Article.objects.exclude(category=self.uncategorized).values('source__name').annotate(total=Count('source__name')).order_by('-total')

    def get_category_counts(self, filter=None):
        """
        get list of (category, total) pairs for all
        articles
        """
        if filter is None:
            return Article.objects.exclude(category=self.uncategorized).values('category__name').annotate(total=Count('category__name')).order_by('-total')
        elif filter == "Monthly":
            end = now()
            start = end - timedelta(days=30)
        else:
            end = now()
            start = end - timedelta(days=7)
        
        return Article.objects.filter(published_on__range=(start, end)).values('category__name').annotate(total=Count('category__name')).order_by('-total')

    def get_pending_article_categorization(self):
        """
        get list of (category, total) pairs for all
        articles        
        """
        return Article.objects.filter(category=self.uncategorized).values('edited_by__email').annotate(total=Count('edited_by__email')).order_by('-total')

    def get_article_counts(self, days=7):
        end = now()
        results = []
        for i in range(days):
            start = end - timedelta(days=1)
            counts = Article.objects.filter(published_on__range=(start, end)).count()
            results.append((str(start.date()), counts))
            end = start
        return results

    def gen_email_contents(self):
        results = ""

        total = Article.objects.all().count()
        self.dump_json("stat.json", {"total": total})
        results += f"Total Articles:{total}\n"

        results += "\nPending Queue\n"
        for current in self.get_pending_article_categorization():
            if current['edited_by__email'] is not None:
                results += current['edited_by__email'] + "," + str(current['total']) + "\n"

        results += "\nTotal Aritcles (Last 30 Days):\n"
        last_30_day_data = []
        for current in self.get_article_counts(30):
            ts, count = current
            row = {"ts": ts, "count": count}
            last_30_day_data.append(row)
            results += ts + "," + str(count) + "\n"
        self.dump_json("articles_30_days.json", last_30_day_data)
        self.dump_json("articles_7_days.json", last_30_day_data[:min(7, len(last_30_day_data))])

        results += "\nSource Counts (Categorized)\n"
        source_count_categorized = []
        for current in self.get_source_counts(categorized=True):
            ts, count = current['source__name'], current['total']
            row = {"ts": ts, "count": count}
            source_count_categorized.append(row)
            results += current['source__name'] + "," + str(current['total']) + "\n"
        self.dump_json("source_count_categorized.json", source_count_categorized)

        results += "\nSource Counts (Un-categorized)\n"
        source_count_uncategorized = []
        for current in self.get_source_counts(categorized=False):
            ts, count = current['source__name'], current['total']
            row = {"ts": ts, "count": count}
            source_count_uncategorized.append(row)
            results += current['source__name'] + "," + str(current['total']) + "\n"
        self.dump_json("source_count_uncategorized.json", source_count_uncategorized)

        results += "\nCategory Distribution\n"
        category_distribution = []
        for current in self.get_category_counts():
            results += current['category__name'] + "," + str(current['total']) + "\n"
            ts, count = current['category__name'], current['total']
            row = {"ts": ts, "count": count}
            category_distribution.append(row)
        self.dump_json("category_distribution.json", category_distribution)

        results += "\nCategory Distribution (Weekly)\n"
        category_distribution_weekly = []
        for current in self.get_category_counts(filter="Weekly"):
            ts, count = current['category__name'], current['total']
            row = {"ts": ts, "count": count}
            category_distribution_weekly.append(row)
            results += current['category__name'] + "," + str(current['total']) + "\n"
        self.dump_json("category_distribution_weekly.json", category_distribution_weekly)

        results += "\nCategory Distribution (Monthly)\n"
        category_distribution_monthly = []
        for current in self.get_category_counts(filter="Monthly"):
            ts, count = current['category__name'], current['total']
            row = {"ts": ts, "count": count}
            category_distribution_monthly.append(row)
            results += current['category__name'] + "," + str(current['total']) + "\n"
        self.dump_json("category_distribution_monthly.json", category_distribution_monthly)

        return results


    def handle(self, *args, **options):
        contents = self.gen_email_contents()
        # send_mail(contents, [])