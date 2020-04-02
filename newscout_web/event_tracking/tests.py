import os
from django.test import Client
from django.test import TestCase
from django.conf import settings


class TestEventTracker(TestCase):

    def setUp(self):
        self.client = Client()

    def test_event_track(self):
        pixel_path = os.path.join(settings.STATICFILES_DIRS[0], 'images', "tracker.gif")
        pixel = open(pixel_path, "rb").read()
        response = self.client.get('/event/track/?user=test_user&event=scroll')
        self.assertEqual(response.content, pixel)
