import json
from datetime import date

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse

from .models import Campaign


class AdsViewsTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="admin", password="pass12345")
        self.client = Client()
        self.client.force_login(self.user)

    def test_advert_page_loads(self):
        response = self.client.get(reverse("ads:advert"))
        self.assertEqual(response.status_code, 200)

    def test_create_campaign_json(self):
        response = self.client.post(
            reverse("ads:create_campaign_json"),
            data=json.dumps(
                {
                    "name": "Весенний трафик",
                    "channel": "telegram",
                    "budget": 100000,
                    "start_date": date.today().isoformat(),
                    "description": "Тестовая кампания",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Campaign.objects.filter(name="Весенний трафик").exists())

    def test_update_campaign_status(self):
        campaign = Campaign.objects.create(
            name="Retention",
            channel="email",
            status="draft",
            budget=10000,
            spent=1000,
            start_date=date.today(),
        )

        response = self.client.patch(
            reverse("ads:update_campaign_status_json", args=[campaign.id]),
            data=json.dumps({"status": "active"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, "active")
