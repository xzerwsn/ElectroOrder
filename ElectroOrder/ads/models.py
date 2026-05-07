from django.core.validators import MinValueValidator
from django.db import models


class Campaign(models.Model):
    CHANNEL_CHOICES = [
        ("telegram", "Telegram Ads"),
        ("vk", "VK Ads"),
        ("yandex", "Yandex Direct"),
        ("google", "Google Ads"),
        ("email", "Email"),
    ]

    STATUS_CHOICES = [
        ("draft", "Черновик"),
        ("active", "Активна"),
        ("paused", "На паузе"),
        ("completed", "Завершена"),
    ]

    name = models.CharField(max_length=160, unique=True, verbose_name="Название")
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, verbose_name="Канал")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft", verbose_name="Статус")
    budget = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Бюджет")
    spent = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Потрачено")
    impressions = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Показы")
    clicks = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Клики")
    leads = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Лиды")
    conversions = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Конверсии")
    revenue = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Выручка")
    start_date = models.DateField(verbose_name="Дата запуска")
    end_date = models.DateField(blank=True, null=True, verbose_name="Дата завершения")
    description = models.TextField(blank=True, verbose_name="Описание")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Рекламная кампания"
        verbose_name_plural = "Рекламные кампании"

    def __str__(self):
        return self.name

    @property
    def ctr(self):
        if not self.impressions:
            return 0
        return (self.clicks / self.impressions) * 100

    @property
    def conversion_rate(self):
        if not self.clicks:
            return 0
        return (self.conversions / self.clicks) * 100

    @property
    def cpl(self):
        if not self.leads:
            return 0
        return self.spent / self.leads

    @property
    def roas(self):
        if not self.spent:
            return 0
        return self.revenue / self.spent
