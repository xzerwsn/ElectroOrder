from django.contrib.auth.models import User
from django.db import models


class MarketProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="market_profile")
    phone = models.CharField(max_length=32, blank=True, verbose_name="Телефон")
    city = models.CharField(max_length=120, blank=True, verbose_name="Город")
    delivery_address = models.TextField(blank=True, verbose_name="Адрес доставки")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Профиль магазина"
        verbose_name_plural = "Профили магазина"

    def __str__(self):
        return f"Market profile for {self.user.username}"
