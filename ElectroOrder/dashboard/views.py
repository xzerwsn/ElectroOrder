from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_http_methods
import json
from django.utils import timezone
from django.http import JsonResponse
from .models import Order, OrderItem
from django.db.models import OuterRef, Subquery, Count

# Create your views here.
def dashboard(request):

    # Заказы на площадке
    orders = Order.objects.all()

    # Текущая дата
    now = timezone.now()

    # ==========================================
    # ВСЕ ЗАКАЗЫ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
    # ==========================================
    
    # Подзапрос для получения первого товара в заказе
    first_item_subquery = OrderItem.objects.filter(
        order=OuterRef('pk')
    ).order_by('id').values('product__name')[:1]
    
    # Подзапрос для общего количества товаров
    total_items_subquery = OrderItem.objects.filter(
        order=OuterRef('pk')
    ).annotate(
        total=Count('id')
    ).values('total')
    
    # ВСЕ ЗАКАЗЫ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
    orders = Order.objects.annotate(
        first_product=Subquery(first_item_subquery),
        items_count=Subquery(total_items_subquery)
    ).select_related('user').order_by('-created_at')

    total_orders_count = orders.count()

    for order in orders:
        if not order.total_amount:
            total = sum(
                item.total_price if item.total_price else 0 
                for item in order.items.all()
            )
            order.total_amount = total
            order.save(update_fields=['total_amount'])

    months = {
        1: "Января",
        2: "Февраля",
        3: "Марта",
        4: "Апреля",
        5: "Мая",
        6: "Июня",
        7: "Июля",
        8: "Августа",
        9: "Сентября",
        10: "Октября",
        11: "Ноября",
        12: "Декабря",
    }

    context = {
        "title": "Панель управления - ElectroOrders",
        
        # Даты
        'current_year': now.year,
        'current_month': months[now.month],
        'current_day': now.day,
        'current_date': now,
        
        # Заказы для таблицы
        'orders': orders,
        'all_orders_count': total_orders_count,
        
        # Статусы заказов для фильтров
        'order_statuses': Order.STATUS_CHOICES,
    }

    return render(request, "dashboard/dashboard.html", context)

def order_detail(request, order_id):
    order = get_object_or_404(Order.objects.select_related('user'), id=order_id)
    data = {
        'id': order.id,
        'user': order.user.username,
        'total': order.total_amount,
        'status': order.get_status_display(),
        'created_at': order.created_at.strftime('%d.%m.%Y'),
    }

    return JsonResponse(data)

@require_http_methods(["PATCH"])
def update_order_status(request, order_id):
    try:
        # Находим заказ по ID
        order = Order.objects.get(id=order_id)

        # Читаем, что прислал пользователь
        data = json.loads(request.body)
        new_status = data.get('status')

        # Меняем статус и сохраняем
        if new_status:

            order.status = new_status
            order.save()

            return JsonResponse({
                'success': True,
                'status': order.get_status_display(),
            })
        
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Заказ не найден'}, status=404)
    
    return JsonResponse({'error': 'Неверный статус'}, status=400)
