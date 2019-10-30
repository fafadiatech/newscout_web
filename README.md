# NewScout

News/Magazine Site powered by Django

## Architecture

1. Web Framework
    - Django {Possibly Python 3}
    - Django Rest Framework for APIs
1. DB
    - Postgres
1. Data Ingestion Pipeline
    - Crawler written in Colly {which is a Golang Library}
1. Indexer
    - Elastic Search

## Feature Supported

1. Aggregate News from Multiple Sites
1. APIs
1. Easy to Browse
1. Content Recommendation
1. Email Digest
1. Auto Complete
1. Search
1. Advanced Search

## Bonus Goal

1. Build a Text Summarization Script

# Setup:

1. Clone django news site repository `git clone git@bitbucket.org:fafadiatech/django-ft-news-site.git`
1. Create python 3 virtual environment `virtualenv -p /usr/bin/python3 /path/to/env/env_name`
1. Activate your environment `source /path/to/env/env_name/bin/activate`
1. Install requirements `pip install -r requirements.txt`
1. Install postgresql database `sudo apt-get install postgresql-9.5 postgresql-client-9.5 postgresql-client-common postgresql-common postgresql-contrib`
1. Create postgresql database
    ```sh
    psql -U postgres
    create database newscout;
    \q
    ```
1. Change database settings in `settings.py`
    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'newscout',
            'USER': 'postgres',
            'PASSWORD': 'postgres',
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }
    ```
1. Create migrations and migrate database
    ```sh
    python manage.py makemigrations
    python manage.py migrate
    ```
1. Load initial database `./load_data.sh`
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

