# NewScout

Django Power Web + Mobile App for News & Magazine Publishers

## Feature Supported

1. Web Application
   1. Mobile Responsive
   1. ReactJS based Components
   1. Fast Rendering & Speed
1. Dashboard
   1. Analytics for Web & Mobile
   1. Authoring Tool
1. Ad-Delivery System
   1. Configurable Ads Delivery
   1. Built in Ads Delivery System
1. Mobile Applications
   1. Android
   1. iOS {Work in Progress}
1. APIs First
1. Recommendation Engine
1. Article Commenting
1. Enhanced Search
   1. Autocomplete
   1. Suggestions
   1. Advanced Search

## Architecture

![NewScout's Architecture Diagram](./docs/design/images/arch.png "Architecture")

## Bonus Goal

1. Build a Text Summarization Script

# Setup:

1. Clone django news site repository `git clone git@bitbucket.org:fafadiatech/django-ft-news-site.git`
1. Create python 3 virtual environment `virtualenv -p /usr/bin/python3 /path/to/env/env_name`
1. Activate your environment `source /path/to/env/env_name/bin/activate`
1. Update packages `sudo apt-get update && sudo apt install build-essential`
1. Install postgresql `sudo apt-get install postgresql-9.5 postgresql-client-9.5 postgresql-client-common postgresql-common postgresql-contrib`
1. Install requirements `pip install -r requirements.txt`
1. If you don't want to use postgresql database, you can enable **QUICK_MODE**

```python
QUICK_MODE=True
```

in settings.py file it will create sqlite database (You can skip following 3 steps). or You can continue with postgresql database installation.

1. Run the management command to load sample database with fixture. Give appropriate username and password for postgres
   ```sh
   python manage.py create_dummy_data
   ```
1. Change database settings in `settings.py` with appropriate postgres password
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql_psycopg2',
           'NAME': 'newscout_web',
           'USER': 'postgres',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```
1. Install Elastic Search
   ```sh
   wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
   echo "deb https://artifacts.elastic.co/packages/5.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-5.x.list
   sudo apt update && sudo apt upgrade
   sudo apt install apt-transport-https uuid-runtime pwgen openjdk-8-jre-headless
   sudo apt update
   sudo apt install elasticsearch
   ```
1. Ingest data into elasticsearch `python manage.py ingest_data_to_elastic`
