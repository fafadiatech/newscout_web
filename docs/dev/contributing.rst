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
14. Install pre-commit for formatting and linting
    .. code-block:: sh

        pip install pre-commit
    
    1. Add pre-commit to requirements.txt
    2. Define .pre-commit-config.yaml with the hooks you want to include
    3. Hooks Included
        .. code-block:: sh
            
            repos:
            -   repo: https://github.com/ambv/black
            rev: stable
                hooks:
                - id: black
                language_version: python3.6
            -   repo: https://github.com/pre-commit/pre-commit-hooks
                rev: v1.2.3
                hooks:
                - id: flake8
    4. Run pre-commit install to install git hooks



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


Designing good APIs
```````````````````

NewScout is developed using `Django rest framework <https://www.django-rest-framework.org/>`_. We are using existing features of Django rest framework, like `Generic <https://www.django-rest-framework.org/api-guide/generic-views/>`_ classes and `serialization <https://www.django-rest-framework.org/api-guide/serializers/>`_.


Implement GET request
~~~~~~~~~~~~~~~~~~~~~

A good way to implement GET request would be, `APIView <https://www.django-rest-framework.org/tutorial/3-class-based-views/>`_ provided by django rest framework.

.. code-block:: python

    class UserAPIView(APIView):
        def get(self, request):
            usernames = [user.username for user in User.objects.all()]
            return Response(create_response(usernames))


Implement POST request
~~~~~~~~~~~~~~~~~~~~~~

A good way to implement POST request would be, `APIView <https://www.django-rest-framework.org/tutorial/3-class-based-views/>`_ provided by django rest framework.

.. code-block:: python

    class UserAPIView(APIView):
        def post(self, request):
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(create_response(serializer.data), status=status.HTTP_201_CREATED)
            return Response(create_error_response(serializer.errors), status=status.HTTP_400_BAD_REQUEST)


Implement PUT request
~~~~~~~~~~~~~~~~~~~~~

A good way to implement PUT request would be, `APIView <https://www.django-rest-framework.org/tutorial/3-class-based-views/>`_ provided by django rest framework.

.. code-block:: python

    class UserAPIView(APIView):
        def put(self, request, pk=None):
            snippet = self.get_object(pk)
            serializer = UserSerializer(snippet, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(create_response(serializer.data), status=status.HTTP_201_CREATED)
            return Response(create_error_response(serializer.errors), status=status.HTTP_400_BAD_REQUEST)


Implement DELETE request
~~~~~~~~~~~~~~~~~~~~~~~~

A good way to implement DELETE request would be, `APIView <https://www.django-rest-framework.org/tutorial/3-class-based-views/>`_ provided by django rest framework.

.. code-block:: python

    class UserAPIView(APIView):
        def delete(self, request, pk=None):
            snippet = self.get_object(pk)
            snippet.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


Implement LIST or RETRIEVE methods for specific model
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Implementing LIST or RETRIEVE method for specific model, you can use `viewset <https://www.django-rest-framework.org/api-guide/viewsets/>`_.

.. code-block:: python

    class UserViewSet(viewsets.ViewSet):
        """
        A simple ViewSet for listing or retrieving users.
        """
        def list(self, request):
            queryset = User.objects.all()
            serializer = UserSerializer(queryset, many=True)
            return Response(create_response(serializer.data))

        def retrieve(self, request, pk=None):
            queryset = User.objects.all()
            user = get_object_or_404(queryset, pk=pk)
            serializer = UserSerializer(user)
            return Response(create_response(serializer.data))


Implement router for viewset
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Router allows you to quickly declare all of the common routes for a given viewset. Instead of declaring separate routes for your views, a router declares them in a single line of code. For above viewset example we need to map this viewset to specific url `router <https://www.django-rest-framework.org/api-guide/routers/>`_.

.. code-block:: python

    from rest_framework import routers
    router = routers.SimpleRouter()
    router.register(r'users', UserViewSet)
    urlpatterns = router.urls


Implement authentication for views
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

NewScout uses token and session authentication for api's mobile client uses `token <https://www.django-rest-framework.org/api-guide/authentication/>`_ authentication and webclient
uses `session <https://www.django-rest-framework.org/api-guide/authentication/>`_ based django authentication. You have to add authenticated permission class to your view.

.. code-block:: python

    permission_classes = (IsAuthenticated,)


Output format
~~~~~~~~~~~~~

NewScout follows specific format for output data. You can create_response and create_error_response to format output data. Following is example format of success response and error response.

.. code-block:: json

    {
        "header": {
            "status": "1"
        },
        "body": {
            "results": [
                {
                    "id": 11,
                    "title": "test title",
                    "source": "test source",
                    "category": "test category",
                    "hash_tags": [
                    "test hashtag 1",
                    "test hashtag 2"
                    ]
                },
                {
                    "id": 12,
                    "title": "test title",
                    "source": "test source",
                    "category": "test category",
                    "hash_tags": [
                    "test hashtag 1",
                    "test hashtag 2"
                    ]
                }
            ]
        }
    }

.. code-block:: json

    {
        "header": {
            "status": "0"
        },
        "errors": {
            "errorList": [
                {
                    "field": "domain",
                    "field_error": "Domain id is required"
                }
            ]
        }
    }
