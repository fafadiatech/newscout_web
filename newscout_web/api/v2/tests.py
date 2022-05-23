import json
import requests
import pytest


@pytest.fixture
def base_url():
    return "http://165.232.179.227:8000/"


@pytest.mark.parametrize("url", [("api/v2/trending/?domain=newscout")])
def test_trending_api(base_url,url):
    """
    this testcase is used to test trending articles
    """
    print(f"{base_url}{url}")
    response = requests.get(f"{base_url}{url}")
    print(response)
    json_response  = response.json()
    assert len(json_response["results"])>1
    assert response.status_code == 200


@pytest.mark.parametrize("url", [("api/v2/source/")])
def test_get_all_sources(base_url,url):
    """
    this testcase is used to test all the available sources in Newscout
    """
    print(f"{base_url}{url}")
    response = requests.get(f"{base_url}{url}")
    print(response)
    json_response  = response.json()
    assert len(json_response["results"])>1
    assert response.status_code == 200


@pytest.mark.parametrize("url", [("api/v2/categories/")])
def test_get_all_category(base_url,url):
    """
    this testcase is used to test all news categories
    """
    print(f"{base_url}{url}")
    response = requests.get(f"{base_url}{url}")
    print(response)
    json_response  = response.json()
    assert len(json_response["results"])>1
    assert response.status_code == 200


@pytest.mark.parametrize("url", [("api/v2/menus/?domain=newscout")])
def test_get_all_menus(base_url,url):
    """
    this testcase is used to test all Menus
    """
    print(f"{base_url}{url}")
    response = requests.get(f"{base_url}{url}")
    print(response)
    json_response  = response.json()
    assert len(json_response["results"])>1
    assert response.status_code == 200


@pytest.mark.parametrize("url", [("api/v2/signup/")])
def test_post_signup(base_url,url):
    """
    this testcase is used to test for a new signup user
    """
    print(f"{base_url}{url}")
    data = {
        "email": "archana@gmail.com",
        "password": "archana",
        "first_name": "archana",
        "last_name": "gawari",
    }
    response = requests.post(f"{base_url}{url}" , data = data)
    print(response)
    json_response  = response.json()
    assert response.status_code == 200
    assert json_response["body"]["Msg"] == "sign up successfully"
    
    

@pytest.mark.parametrize("url", [("api/v2/signup/")])
def test_post_error_signup(base_url,url):
    """
    this testcase is used to test for a new signup user error
    """
    print(f"{base_url}{url}")
    data = {
        "email": "archana@gmail.com",
        "password": "archana",
        "first_name": "archana",
    }
    response = requests.post(f"{base_url}{url}" , data = data)
    print(response)
    json_response  = response.json()
    assert response.status_code == 403


@pytest.mark.parametrize("url", [("api/v2/login/")])
def test_post_login(base_url,url):
    """
    this testcase is used to test login using email and password
    """
    print(f"{base_url}{url}")
    data = {
        "email": "archana@gmail.com",
        "password": "archana",
    }
    response = requests.post(f"{base_url}{url}" , data = data)
    print(response)
    json_response  = response.json()
    assert response.status_code == 200
       