# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.test import TestCase
from rest_framework.test import APITestCase,APIClient
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from advertising.models import Campaign,AdGroup,AdType,Advertisement
from core.models import Category

User = get_user_model()

client = APIClient()
user = User.objects.get(username='rsqwerty')
#token = Token.objects.get(user=user)
#client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
client.force_authenticate(user=user)

class NewscoutApiTest(APITestCase):
    def test_get_trending_articles(self):
        res_count = 0
        url = '/api/v1/trending/'
        res = client.get(url,format='json')
        for k,v in res.data.items():
            for x,y in v.items():
                if len(y) == 1:
                    continue
                else:
                    res_count = len(y)    

        self.assertGreater(res_count, 0)

    def test_post_category_bulk_update(self):
        url = '/api/v1/categories/bulk/'
        success_msg = 'cool'
        data = {
                'categories':'125',
                'articles': {},
        } 
        res = client.post(url,data,format='json')
        res_status = res.status_code

        self.assertEqual(res_status,200)    

    def test_get_news_category(self):
        res_count = 0
        url = '/api/v1/categories/'
        res = client.get(url,format='json')
        res_count = len(res.data['body']['categories'])

        self.assertGreater(res_count, 0)

    def test_post_new_category(self):
        url = '/api/v1/categories/'
        res_name = ''
        req_name = 'Indian Economy'
        res = client.post(url,[{'name':req_name}], format='json')
        for x in res.data['body']:
            res_id = x['id']

        res = client.get(url)
        for x in res.data['body']['categories']:
            if x['id'] == res_id:
                res_name = x['name']

        self.assertEqual(res_name,req_name)

    def test_put_new_category(self):
        url = '/api/v1/categories/'
        req_id = 166
        req_name = 'Food and Vloging'
        res_name = ''
        client.put(url,{'id':req_id,'name':req_name},format='json')
        res = client.get(url)
        for x in res.data['body']['categories']:
            if x['id'] == req_id:
                res_name = x['name']

        self.assertEqual(req_name,res_name)

    def test_get_liked_articles(self):
        res_count = 0
        url = '/api/v1/articles/like-news-list/'
        res = client.get(url,format='json')
        res_count = len(res.data['body']['results'])
        
        self.assertGreater(res_count, 0)

    def test_get_bookmarked_articles(self):
        url_post_bookmark = '/api/v1/articles/bookmark/'
        req_id = 998398
        client.post(url_post_bookmark,{'article_id':req_id,'user':user.id})

        url = '/api/v1/bookmark-articles/bookmark-news-list/'
        res = client.get(url,format='json')
        for x in res.data['body']['results']:
            res_id = x['article']

        self.assertEqual(req_id,res_id)
    
    def test_post_tags(self):
        url = '/api/v1/tags/save/'
        res_msg = ''
        success_msg = 'Successfully saved tags'
        res = client.post(url,{'tags':'India'},format='json')
        res_msg = res.data['body']['Msg']
    
        self.assertEqual(success_msg,res_msg)    

    def test_get_all_sources(self):
        res_count = 0
        url = '/api/v1/source/'
        res = client.get(url,format='json')
        res_count = len(res.data['body']['results'])

        self.assertGreater(res_count,0)

    def test_post_articles_bookmark(self):
        success_msg = 'Article bookmarked successfully'
        res_msg = ''
        url = '/api/v1/articles/bookmark/'
        res = client.post(url,{'article_id':'998398','user':user.id})
        res_msg = res.data['body']['Msg']
    
        self.assertEqual(success_msg,res_msg)

    def test_get_article_details(self):
        req_id = 998398
        res_id = 0
        url = '/api/v1/articles/'+str(req_id)+'/'
        res = client.get(url,format='json')
        res_id = res.data['body']['article']['id']

        self.assertEqual(req_id,res_id)

    def test_post_login(self):
        res_id = 0
        url = '/api/v1/login/'
        data = {
            'device_name':'A',
            'device_id':'A',
            'email':'rsqwerty@gmail.com',
            'password':'ftech#1234'
            }

        res = client.post(url,data,format = 'json')
        res_id = res.data['body']['user']['id']
                
        self.assertGreater(res_id,0)

    def test_get_logout(self):
        url_login = '/api/v1/login/'
        data = {
            'device_name':'A',
            'device_id':'A',
            'email':'rsqwerty@gmail.com',
            'password':'ftech#1234'
            }

        client.post(url_login,data,format = 'json')

        url = '/api/v1/logout/'
        success_msg = 'User has been logged out'
        res = client.get(url)
        res_msg = res.data['body']['Msg']
        
        self.assertEqual(success_msg,res_msg)    

    def test_post_signup(self):
        url = '/api/v1/signup/'
        res_msg = ''
        success_msg = 'sign up successfully'
        data = {
            'email' : 'rs@gmail.com',
            'password' : 'ftech#123',
            'first_name' : 'Rishi',
            'last_name' : 'samantra',
        }
        res = client.post(url,data,format='json')
        res_msg = res.data['body']['Msg']
        
        self.assertEqual(res_msg,success_msg)    
    
    def test_post_forgot_password(self):
        url = '/api/v1/forgot-password/'
        success_msg = 'New password sent to your email'
        res_msg = ''
        data = {
            'email' : 'rushikesh@fafadiatech.com',
        }
        res = client.post(url,data)
        res_msg = res.data['body']['Msg']
        
        self.assertEqual(success_msg,res_msg)        

    def test_post_change_password(self):
        success_msg = 'Password chnaged successfully'
        res_msg = ''
        url = '/api/v1/change-password/'
        data = {
            'user':user.id,
            'old_password' : 'ftech#1234',
            'password' : 'ftech#123',
            'confirm_password' : 'ftech#123',
        }

        res = client.post(url,data)
        res_msg = res.data['body']['Msg']

        self.assertEqual(success_msg,res_msg)

    def test_post_new_device(self):
        url = '/api/v1/device/'
        success_msg = 'Device successfully created'
        data = {
            'device_id' : 'AndroidNX00G',
            'device_name' : 'AndroidNougat',
        }
        res = client.post(url,data)
        res_msg = res.data['body']['Msg']
        
        self.assertEqual(res_msg,success_msg)           
    
    def test_get_article_search(self):
        res_count = 0
        url = '/api/v1/article/search/?domain=newscout'
        res = client.get(url)
        res_count = len(res.data['body']['results'])
        
        self.assertGreater(res_count,0)

    def test_get_menus(self):
        res_count = 0
        url = '/api/v1/menus/?domain=newscout'
        res = client.get(url)
        for k,v in res.data.items():
            for x,y in v.items():
                if len(y) == 1:
                    continue
                else:    
                    res_count = len(y)

        self.assertGreater(res_count,0)

    def test_post_new_article(self):
        url = '/api/v1/article/create-update/'
        req_title_name = 'NBA Preseason has started'
        data = {
            'title':req_title_name,
            'source' : '1',
            'source_url' : 'https://www.nba.com',
            'cover_image': 'https://i.pinimg.com/originals/46/61/2d/46612d0fce324acf1d1958f4f50292ec.jpg',
            'blurb': '',
            'published_on': '2019-11-06 12:15:34.870987',
            'spam':'True',
            'domain':'1',
        }
        res = client.post(url,data,format='json')
        res_title_name = res.data['body']['title']
        
        self.assertEqual(req_title_name,res_title_name)

    def test_put_existing_article(self):
        url = '/api/v1/article/create-update/'
        req_id = 998398
        req_title_name = 'NBA Preseason has started'
        data = {
            'id' : req_id,
            'title':req_title_name,
            'source' : '1',
            'source_url' : 'https://www.nba.com',
            'cover_image': 'https://i.pinimg.com/originals/46/61/2d/46612d0fce324acf1d1958f4f50292ec.jpg',
            'blurb': '',
            'published_on': '2019-11-06 12:15:34.870987',
            'spam':'True',
            'domain':'1',
        }
        client.put(url,data,format='json')
        url_get_article_details = '/api/v1/articles/'+str(req_id)+'/'
        res = client.get(url_get_article_details,format='json')
        res_title_name = res.data['body']['article']['title']
        
        self.assertEqual(req_title_name,res_title_name)       

    def test_get_daily_digest(self):
        res_count = 0
        url = '/api/v1/daily-digest/'
        res = client.get(url)
        res_count = len(res.data['body']['results'])
        
        self.assertGreater(res_count,0)

    def test_get_article_recommendation(self):
        url = '/api/v1/articles/998343/recommendations/'
        res = client.get(url)
        res_count = len(res.data['body']['results'])

        self.assertGreater(res_count,0)       

    def test_get_campaign_categories(self):
        url = '/ads/campaigns/categories/'
        res_campaign_count = 0
        res_category_count = 0
        res = client.get(url)
        res_category_count = len(res.data['body']['categories'])

        self.assertGreater(res_category_count,0)
    
    def test_post_new_campaign(self):
        url = '/ads/campaigns/'
        req_campaign_name = 'TestCampaign'
        res_campaign_name = ''
        data = {
            'name' : req_campaign_name,
            'is_active' : 'True',
            'daily_budget' : '99.99',
            'max_bid' : '89.99',
            'start_date' : '2019-11-01 12:15:34.870987',
            'end_date' : '2019-11-06 12:15:34.870987'

        }
        client.post(url,data,format='json')
        res = client.get(url)
        for x in res.data['body']:
            if x['name'] == req_campaign_name:
                res_campaign_name = x['name']

        self.assertEqual(req_campaign_name,res_campaign_name)
    
    def test_put_existing_campaign(self):
        url_post_campaign = '/ads/campaigns/'
        req_campaign_name = 'TestCampaign'
        res_change_name = ''
        data = {
            'name' : req_campaign_name,
            'is_active' : 'True',
            'daily_budget' : '99.99',
            'max_bid' : '89.99',
            'start_date' : '2019-11-01 12:15:34.870987',
            'end_date' : '2019-11-06 12:15:34.870987'

        }
        client.post(url_post_campaign,data,format='json')

        url = '/ads/campaigns/'
        req_change_name = 'TestCampaign11'
        data = {
            'id' : '1',
            'name' : req_change_name,
            'is_active' : 'True',
            'daily_budget' : '99.99',
            'max_bid' : '89.99',
            'start_date' : '2019-11-01 12:15:34.870987',
            'end_date' : '2019-11-06 12:15:34.870987'

        }
        client.put(url,data,format='json')
        res = client.get(url)
        for x in res.data['body']:
            if x['id'] == 1:
                res_change_name = x['name']

        self.assertEqual(req_change_name,res_change_name)     
    
    def test_get_campaigns(self):
        url_post_campaign = '/ads/campaigns/'
        req_campaign_name = 'TestCampaign'
        data = {
            'name' : req_campaign_name,
            'is_active' : 'True',
            'daily_budget' : '99.99',
            'max_bid' : '89.99',
            'start_date' : '2019-11-01 12:15:34.870987',
            'end_date' : '2019-11-06 12:15:34.870987'

        }
        client.post(url_post_campaign,data,format='json')

        res_count = 0
        url = '/ads/campaigns/'
        res = client.get(url)
        res_count = len(res.data['body'])

        self.assertGreater(res_count,0)
    
    def test_delete_campaign(self):
        success_msg = 'Campaign deleted successfully'
        url_post_campaign = '/ads/campaigns/'
        req_campaign_name = 'TestCampaign'
        data = {
            'name' : req_campaign_name,
            'is_active' : 'True',
            'daily_budget' : '99.99',
            'max_bid' : '89.99',
            'start_date' : '2019-11-01 12:15:34.870987',
            'end_date' : '2019-11-06 12:15:34.870987'

        }
        client.post(url_post_campaign,data,format='json')
        res_msg = ''
        url = '/ads/campaigns/1/'
        res = client.delete(url)
        res_msg = res.data['body']['Msg']

        self.assertEqual(success_msg,res_msg)        
        
    def test_get_all_categories(self):
        res_groups_count = 0
        res_types_count = 0
        url = '/ads/grouptypes/'
        res = client.get(url)
        res_groups_count = len(res.data['body']['groups'])
        res_types_count = len(res.data['body']['types'])

        self.assertGreater(res_groups_count,0)
        self.assertGreater(res_types_count,0) 

    def test_get_ads(self):
        res_count = 0
        url = '/ads/schedules/'
        res = client.get(url)
        for k,v in res.data.items():
            if k == 'header':
                res_status = v['status']

        self.assertEqual(res_status,'1')    
    
    def test_get_advertisement(self):
        res_count = 0
        url = '/ads/advertisement/'
        res = client.get(url)
        res_count = len(res.data['body'])

        self.assertGreater(res_count,0)

    def test_post_advertisement(self):    
        url = '/ads/advertisement/'
        req_text = 'NewscoutApiTest'
        adgroup = AdGroup.objects.get(id=1)
        adtype = AdType.objects.get(id=1)
        data = {
            'adgroup' : adgroup.id,
            'ad_type' : adtype.id,
            'ad_text' : req_text,
            'ad_url'  : 'http://newscout.in/',
            'file' : '/home/rushikesh/Downloads/20191107_174950.jpg',
            'is_active': 'True',
            'impsn_limit' : '99'
        }
        res = client.post(url,data)
        res_text = res.data['body']['ad_text']
        
        self.assertEqual(req_text,res_text)        
        
    def test_put_advertisement(self):
        url = '/ads/advertisement/'
        req_text = 'TestNewscout'
        adgroup = AdGroup.objects.get(id=1)
        adtype = AdType.objects.get(id=1)
        data = {
            'id' : '1',
            'file' : '/home/rushikesh/Downloads/20191107_174950.jpg',
            'adgroup' : adgroup.id,
            'ad_type' : adtype.id,
            'ad_text' : req_text,
            'ad_url'  : 'http://newscout.in/',
        }
        res = client.put(url,data)
        if res.data['body']['id'] == 1:
            res_text = res.data['body']['ad_text']

        self.assertEqual(req_text,res_text)

    def test_delete_advertisement(self):
        url = '/ads/advertisement/1/'
        success_msg = 'Advertisement deleted successfully'
        res = client.delete(url)
        res_msg = res.data['body']["Msg"]
        
        self.assertEqual(success_msg,res_msg)        

    def test_get_adgroup(self):
        res_count = 0
        url = '/ads/adgroups/'
        res = client.get(url)
        res_count = len(res.data['body'])

        self.assertGreater(res_count,0)     

    def test_post_adgroup(self):
        url = '/ads/adgroups/'
        category = [133,147,160]
        data = {
            'campaign' : 1,
            'category' : category,
            'is_active': 'True'
        }
        res = client.post(url,data)
        for k,v in res.data.items():
            if k == 'header':
                res_status=v['status']
        
        self.assertEqual(res_status,'1')

    def test_put_adgroup(self):
        url = '/ads/adgroups/'
        update_cat = [147,160]
        data = {
            'id' : 1,
            'campaign' : 1,
            'category' : update_cat,
            'is_active': 'True'
        }
        res = client.put(url,data)
        for k,v in res.data.items():
            if k == 'header':
                res_status=v['status']
        
        self.assertEqual(res_status,'1')

    def test_delete_adgroup(self):
        url = '/ads/adgroups/1/'
        success_msg = 'AdGroup deleted successfully'
        res = client.delete(url)
        res_msg = res.data['body']['Msg']
        
        self.assertEqual(res_msg,success_msg)

    #Social-Login-pending
    def post_social_login(self):
        url = '/api/v1/social-login/'
        data = {
            'token_id':'1',
            'provider':'facebook',
            'device_id':'A',
            'device_name':'A',
        }
        res = client.post(url,data)
        print(res.data)
    
    #hashtags-pending
    def get_hastags(self):
        url = '/api/v1/tags/'
        res = client.get(url,format='json')
        print(res.data)
        for k,v in res.data.items():
            for x,y in v.items():
                res_str = y

        self.assertEqual(res_str,"No trending tags")    