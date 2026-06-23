from django.contrib import admin
from django.utils.html import format_html
from .models import Order, Product, OrderItem

class OrderItemInLine(admin.TabularInline):

    # Инлайн для отображения товаров внутри заказа

    model = OrderItem
    extra = 0 # Не показывать пустые строки
    readonly_fields = ['price', 'total_price']

    def total_price(self, obj):
        return obj.total_price
    
    total_price.short_description = 'Сумма'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'id']
    inlines = [OrderItemInLine]
    readonly_fields = ['created_at']

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for instance in instances:
            if not instance.price and instance.product:
                instance.price = instance.product.price
            instance.save()
        formset.save_m2m()

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock', 'is_active', 'photo_preview']
    list_filter = ['is_active']
    search_fields = ['name']
    readonly_fields = ['photo_preview']

    def photo_preview(self, obj):
        """Показывает превью фотографии в админке"""
        if obj.photo:
            return format_html(
                '<img src="{}" style="max-height: 200px;" />',
                obj.photo.url
            )
        return "Нет фото"

    photo_preview.short_description = 'Превью'
