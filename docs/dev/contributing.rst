Contributing Guide
==================

Overview
````````

Intention of writing this documentation is to help you get started. To get an overview, we would recommend reading :doc:`../design/architecture` document.

Developer Setup
```````````````

1. Clone current repository
2. Create python 3 virtual environment `virtualenv -p /usr/bin/python3 /path/to/env/env_name`
3. Activate your environment `source /path/to/env/env_name/bin/activate`
4. Install requirements `pip install -r requirements.txt`
5. If you don't want to use postgresql database, you can enable **QUICK_MODE** in settings.py file it will create sqlite database (You can skip following 3 steps). or You can continue with postgresql database installation.
    .. code-block:: python

        QUICK_MODE=True
6. Install postgresql database `sudo apt-get install postgresql-9.5 postgresql-client-9.5 postgresql-client-common postgresql-common postgresql-contrib`
7. Create postgresql database
    .. code-block:: sh

        psql -U postgres
        create database newscout;
        \q
8. Change database settings in `settings.py`
    .. code-block:: python

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
9. Create migrations and migrate database
    .. code-block:: sh

        python manage.py makemigrations
        python manage.py migrate
10. Load initial database `./load_data.sh`
11. Install Elastic Search
    .. code-block:: sh

        wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
        echo "deb https://artifacts.elastic.co/packages/5.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-5.x.list
        sudo apt update && sudo apt upgrade
        sudo apt install apt-transport-https uuid-runtime pwgen openjdk-8-jre-headless
        sudo apt update
        sudo apt install elasticsearch
12. Ingest data into elasticsearch `python manage.py ingest_data_to_elastic`
13. Install MongoDB following `Official Docs <https://docs.mongodb.com/manual/installation/>`_. MongoDB is required for Analytics

Submitting a PR
````````````````

NewScout follows `Pull Request <https://www.atlassian.com/git/tutorials/making-a-pull-request>`_ workflow, you can also read `PR based git workflow <https://www.fafadiatech.com/resources/technical/development_process.html#pr-based-git-workflow>`_ . At high level it works as follows:

1. You create a fork under your username
2. You create a feature branch. E.g. `git checkout -b 17-developer-docs`. Things to Note
    1. Branch name should start with Issue No on Github
    2. Use lowercase short description for branch names
3. You work on that feature branch, pushing bunch of commits. Make sure to `Conventional Commit <https://www.conventionalcommits.org/en/v1.0.0-beta.2/>`_ style while creating commit messages
4. When you're done create a PR to **`develop`** branch. Note: Please ensure you're following PR Checklist before submitting.
5. Before working on a new feature or bug-fix be sure to sync
    1. Make sure to switch to `develop` branch. `git checkout develop`
    2. Fetch all upstream branches `git fetch upstream`
    3. Merge all changes with `git merge upstream/develop`

PR Checklist
````````````

Following are some things to keep in mind

General
~~~~~~~

1. Keep PR small but meaningful
2. Make sure names and functions are meaningful
3. Be sure to configure `Pre-commit hooks <https://www.fafadiatech.com/resources/technical/python/precommit_workflow.html>`_, this way you code will be linted and formatted right
4. Make sure you're not doing un-necessary work. E.g.
    1. Iterating over collection just to get last element
    2. Hard-coding of value in test if not required

Testing & Documentation
~~~~~~~~~~~~~~~~~~~~~~~

1. Mandatory Test: You need to write tests if
    1. Submitting a fix
    2. API has changed
    3. Custom logic or calculations are implemented
2. Update Documents:
    1. API Documents: if API has been changed in significant way
    2. User Manual: if you're implementing New Feature