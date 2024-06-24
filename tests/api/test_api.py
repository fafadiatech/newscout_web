import json
import requests

BASE_URL = "http://www.newscout.in/api/v1/"

urls = [
            'articles/union-minister-sanjeev-balyan-visits-bku-president-naresh-tikait-in-farm-outreach-1902869/?domain=newscout',
            'articles/white-house-officials-urge-spending-plan-to-offset-recession-1775836?domain=newscout',
            'articles/elderly-couple-breaks-out-of-tennessee-assisted-living-facility-using-morse-code-1775837?domain=newscout',
            'articles/icici-securities-bullish-on-this-multibagger-it-stock-post-q3-earnings-1903277?domain=newscout',
            'articles/5-days-after-volcano-erupts-first-aid-flights-arrive-in-tonga-1903708?domain=newscout'

            ]

def test_article_api():
    for current in urls:
        final_url = f"{BASE_URL}{current}"
        print(final_url)
        response = requests.get(final_url)
        json_response = json.loads(response.text)
        assert "body" in json_response
        assert "next_article" in json_response["body"]

def test_trending_api():
    final_url = f"{BASE_URL}trending/?domain=newscout"
    print(final_url)
    response = requests.get(final_url)
    json_response = json.loads(response.text)
    assert "body" in json_response
    assert "results" in json_response["body"]
    for current in json_response["body"]["results"]:
        assert (current["articles"][0]["id"])

def test_recommendations_api():
    final_url = f"{BASE_URL}articles/1903524/recommendations/?domain=newscout"
    print(final_url)
    response = requests.get(final_url)
    json_response = json.loads(response.text)
    assert "body" in json_response
    assert "results" in json_response["body"]
    for current in json_response["body"]["results"]:
        assert (current["id"])

if __name__ == "__main__":
    test_recommendations_api()