import json
import requests

BASE_URL = "http://www.newscout.in/api/v1/articles/"

urls = [
            'going-public-pharmeasy-files-for-rs-6250-crore-ipo-1875720/',
            'samsung-announces-first-smartphone-chip-with-amd-ray-tracing-gpu-1902898/',
            'legendary-kathak-dancer-birju-maharaj-dead-1902570/',
            'satellite-photos-show-aftermath-of-attack-on-abu-dhabi-oil-facility-1902938/',
            'india-post-payments-bank-customer-base-crosses-5-crore-mark-1902961/'
            ]

def test_article_api():
    for current in urls:
        final_url = f"{BASE_URL}{current}"
        print(final_url)
        response = requests.get(final_url)
        json_response = json.loads(response.text)
        assert "body" in json_response
        assert "next_article" in json_response["body"]


if __name__ == "__main__":
    test_article_api()

