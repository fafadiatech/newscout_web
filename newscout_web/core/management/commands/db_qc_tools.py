from django.core.management.base import BaseCommand
from core.models import Article
import zulip
import time
from datetime import datetime, timedelta
import pytz
import base64
import smtplib
from email import encoders
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.utils.timezone import now

EMAIL_FROM = ''
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_PASSWORD = ''
MAILING_LIST = []

def send_mail(msg):
    today = now()

    outer = MIMEMultipart()
    outer['Subject'] = 'Articles Quality Check report for ' + today.strftime("%d, %b %Y")
    outer['To'] = ",".join(MAILING_LIST)
    outer['From'] = EMAIL_FROM
    body = MIMEText(msg)
    outer.attach(body)

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
    help = 'Articles Quality Check'
    articles_list = []

    def send_notification_zulip(self,message):
        # Pass the path to your zuliprc file here.
        client = zulip.Client(config_file="~/zuliprc")
        request = {
            "type": "stream",
            "to": "NewScout",
            "topic":"DailyCrawl",
            "content": message,
            }
        result = client.send_message(request)

    def duplicates_same_source(self):
        count = 0
        dup_count = 0
        dup_id = []
        ist = pytz.timezone('Asia/Calcutta')
        articles = Article.objects.filter(published_on__gt= datetime.now(ist) - timedelta(days=1)).values_list("title","source","id")
        for article in articles:
            duplicate = Article.objects.filter(title=article[0]).values()
            #print(duplicate[0]['source_id'])            
            if len(duplicate) > 1:
                for i in range(len(duplicate)):
                    if duplicate[int(i)]['id'] == article[2]:
                        continue
                    elif duplicate[int(i)]['source_id'] == article[1]:
                        source = article[1]
                        dup_source = duplicate[int(i)]['source_id']
                        id = article[2]
                        dup_id.append(duplicate[int(i)]['id'])
                        dup_count += 1
                        #print("New Articles : " + str(source) +" : "+ str(id))
                        #print("Duplicate : "+str(dup_source) +" : "+ str(dup_id))
                        #print("NEXT")
        
        
        if dup_id:
            msg = "Duplicate Ids :{0}".format(",".join(dup_count))
            #self.send_notification_zulip(msg)
            #send_mail(msg)
        else:
            msg = "No Duplicates Found"
            #self.send_notification_zulip(msg)
            #send_mail(msg)

        return msg    

    def article_short_text(self):
        shorttext_article = Article.objects.filter(blurb__lte=175)
        if shorttext_article:
            for article in shorttext_article:
                self.articles_list.append(str(article.id))
            msg = "List of articles having text less than 175 characters Id's are {0}".format(",".join(self.articles_list))    
            #self.send_notification_zulip(msg)
            #send_mail(msg)
        else:
            msg = "All article contains text more than 175 characters"
            #self.send_notification_zulip(msg)
            #send_mail(msg)

        return msg    

    def articles_no_image(self):
        no_image_articles = Article.objects.filter(cover_image='')
        if no_image_articles:
            for article in no_image_articles:
                self.articles_list.append(str(article.id))
            msg = "List of articles having no Image Id's are {0}".format(",".join(self.articles_list))    
            #self.send_notification_zulip(msg)
            #send_mail(msg)
        else:
            msg = "All article contains image"
            #self.send_notification_zulip(msg)
            #send_mail(msg)

        return msg    

    def articles_invalid_date(self):
        count = 0
        ist = pytz.timezone('Asia/Calcutta')
        current_time = datetime.now()
        invalid_articles = Article.objects.filter(published_on__gte = datetime.now(ist))
        if invalid_articles:
            for article in invalid_articles:
                self.articles_list.append(str(article.id))

            invalid_articles.delete()
            msg = "List of articles have been deleted having publishing date greater than current date Id's are {0}".format(",".join(self.articles_list))
            #self.send_notification_zulip(msg)
            #send_mail(msg)
        else:
            msg = "No articles found having publishing date greater than current date"
            #self.send_notification_zulip(msg)
            #send_mail(msg)
        
        return msg

    def handle(self,*args,**options):
        help = "Articles Quality Check"

        dup_articles = self.duplicates_same_source()
        invalid_date = self.articles_invalid_date()
        no_image = self.articles_no_image()
        short_text = self.article_short_text()

        msg = "All Quality check:"+invalid_date+"\n"+no_image+"\n"+short_text+"\n"+dup_articles
        self.send_notification_zulip(msg)
        send_mail(msg)