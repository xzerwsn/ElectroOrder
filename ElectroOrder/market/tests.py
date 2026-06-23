from django.test import TestCase
from django.urls import reverse

from dashboard.models import Order, OrderItem, Product
from django.contrib.auth.models import User
from .models import MarketProfile


class MarketViewsTests(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="iPhone 15 Pro",
            price=120000,
            stock=8,
            is_active=True,
        )

    def test_market_home_loads(self):
        response = self.client.get(reverse("market:home"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "ElectroOrder")

    def test_market_catalog_loads(self):
        response = self.client.get(reverse("market:catalog"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.product.name)

    def test_market_product_detail_loads(self):
        response = self.client.get(reverse("market:product_detail", args=[self.product.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.product.name)

    def test_add_to_cart_updates_session(self):
        response = self.client.post(
            reverse("market:add_to_cart", args=[self.product.id]),
            {"quantity": 2, "next": reverse("market:cart")},
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.session["market_cart"][str(self.product.id)], 2)

    def test_checkout_creates_order_and_items(self):
        session = self.client.session
        session["market_cart"] = {str(self.product.id): 2}
        session.save()

        response = self.client.post(
            reverse("market:place_order"),
            {
                "full_name": "Ivan Petrov",
                "email": "ivan@example.com",
                "phone": "+79991234567",
                "city": "Moscow",
                "address": "Lenina 1",
                "payment_method": "card",
            },
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(Order.objects.count(), 1)
        order = Order.objects.first()
        self.assertEqual(order.total_amount, 240000)
        self.assertEqual(OrderItem.objects.filter(order=order).count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 6)

    def test_register_creates_account_and_logs_user_in(self):
        response = self.client.post(
            reverse("market:register"),
            {
                "username": "buyer01",
                "first_name": "Ivan",
                "last_name": "Petrov",
                "email": "buyer01@example.com",
                "password1": "StrongPass123",
                "password2": "StrongPass123",
            },
        )

        self.assertEqual(response.status_code, 302)
        self.assertTrue(User.objects.filter(username="buyer01").exists())
        self.assertIn("_auth_user_id", self.client.session)

    def test_login_page_authenticates_user(self):
        User.objects.create_user(username="buyer02", email="buyer02@example.com", password="StrongPass123")

        response = self.client.post(
            reverse("market:login"),
            {
                "username": "buyer02",
                "password": "StrongPass123",
            },
        )

        self.assertEqual(response.status_code, 302)
        self.assertIn("_auth_user_id", self.client.session)

    def test_profile_page_shows_previous_orders(self):
        user = User.objects.create_user(username="buyer03", email="buyer03@example.com", password="StrongPass123", first_name="Ivan", last_name="Petrov")
        Order.objects.create(user=user, total_amount=120000, status="pending")
        self.client.force_login(user)

        response = self.client.get(reverse("market:profile"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Ivan Petrov")
        self.assertContains(response, "120000")

    def test_profile_update_changes_name_and_delivery_data(self):
        user = User.objects.create_user(username="buyer04", email="buyer04@example.com", password="StrongPass123")
        MarketProfile.objects.create(user=user, phone="", city="", delivery_address="")
        self.client.force_login(user)

        response = self.client.post(
            reverse("market:update_profile"),
            {
                "first_name": "Anna",
                "last_name": "Sidorova",
                "email": "buyer04-new@example.com",
                "phone": "+79990001122",
                "city": "Kazan",
                "delivery_address": "Pushkina 10",
            },
        )

        self.assertEqual(response.status_code, 302)
        user.refresh_from_db()
        profile = user.market_profile
        self.assertEqual(user.first_name, "Anna")
        self.assertEqual(user.last_name, "Sidorova")
        self.assertEqual(user.email, "buyer04-new@example.com")
        self.assertEqual(profile.phone, "+79990001122")
        self.assertEqual(profile.city, "Kazan")
        self.assertEqual(profile.delivery_address, "Pushkina 10")
