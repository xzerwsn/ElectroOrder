from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class Order(models.Model):

    STATUS_CHOICES = [

        ('pending', 'В обработке '),
        ('delivered', 'Доставлен'),
        ('new', 'Новый'),
        ('cancelled', 'Отменен')
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name='Пользователь'
    )

    total_amount = models.IntegerField(
        default = 0,
        validators=[MinValueValidator(0)],
        verbose_name="Общая сумма заказа"
    )

    status = models.CharField(
        max_length=20,
        choices = STATUS_CHOICES,
        default='new',
        verbose_name='Статус',
    )

    # Дата создания

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата оформления'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    def __str__(self):
        return f'Заказ №{self.id} от {self.created_at:%d.%m.%Y}'

    def get_total_items(self):
        # Общее кол-во товаров

        return sum(item.quantity for item in self.items.all())
    
    def get_total_amount(self):
        """Безопасное получение суммы"""
        return self.total_amount if self.total_amount else 0
    
    def calculate_total(self):
        """Пересчет общей суммы заказа"""
        total = sum(
            item.total_price if item.total_price else 0 
            for item in self.items.all()
        )
        self.total_amount = total
        self.save(update_fields=['total_amount'])
    


class Product(models.Model):

    name = models.CharField(max_length=200, verbose_name='Название')
    price = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Цена'
        )
    stock = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Количество на складе'
        )
    is_active = models.BooleanField(default=True, verbose_name='Активен')

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'

    def __str__(self):
        return self.name
    
class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Заказ'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name='Товар'
    )
    quantity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Количество'
    )
    price = models.IntegerField(
        validators=[MinValueValidator(0)],
        verbose_name='Стоимость единицы'
    )

    class Meta:
        verbose_name = 'Позиция заказа'
        verbose_name_plural = 'Позиции заказа'
        unique_together = ['order', 'product']

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    @property
    def total_price(self):
        if self.price is None:
            return 0
        return self.price * self.quantity
    
