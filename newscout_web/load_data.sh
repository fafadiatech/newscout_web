#!/bin/bash
echo -e "\n\nLoading Domains"
python manage.py loaddata fixtures/core.domain.json
echo -e "\n\nLoading Categories"
python manage.py loaddata fixtures/core.category.json
echo -e "\n\nLoading Category Association"
python manage.py loaddata fixtures/core.categoryassociation.json
echo -e "\n\nLoading Category Default Images"
python manage.py loaddata fixtures/core.categorydefaultimage.json
echo -e "\n\nLoading Sources"
python manage.py loaddata fixtures/core.source.json
echo -e "\n\nLoading Hashtags"
python manage.py loaddata fixtures/core.hashtag.json
echo -e "\n\nLoading User Profiles"
python manage.py loaddata fixtures/core.baseuserprofile.json
echo -e "\n\nLoading Articles"
python manage.py loaddata fixtures/core.article.json
echo -e "\n\nLoading Article Media"
python manage.py loaddata fixtures/core.articlemedia.json
echo -e "\n\nLoading Submenu"
python manage.py loaddata fixtures/core.submenu.json
echo -e "\n\nLoading Menu"
python manage.py loaddata fixtures/core.menu.json
echo -e "\n\nLoading Devices"
python manage.py loaddata fixtures/core.devices.json
echo -e "\n\nLoading Trending Article"
python manage.py loaddata fixtures/core.trendingarticle.json
echo -e "\n\nLoading Daily Digest"
python manage.py loaddata fixtures/core.dailydigest.json