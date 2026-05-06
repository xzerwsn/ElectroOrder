import calendar
import json
from datetime import timedelta
from decimal import Decimal, InvalidOperation

from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_http_methods, require_POST
from django.utils import timezone
from django.http import JsonResponse
from .models import Order, OrderItem, Product
from django.db.models import OuterRef, Subquery, Count, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required


STATUS_COLORS = {
    'delivered': '#34d399',
    'processing': '#fbbf24',
    'new': '#4da6ff',
    'cancelled': '#f87171',
    'pending': '#fbbf24',
    'shipped': '#22d3ee',
}

MONTH_LABELS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

def get_products_for_order():
    products_qs = Product.objects.filter(is_active=True).order_by('name')

    products = []
    for product in products_qs:
        products.append({
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'stock': product.stock,
            })
    return products

def percent_delta(current, previous):
    current = Decimal(current or 0)
    previous = Decimal(previous or 0)
    if previous == 0:
        return Decimal('0') if current == 0 else Decimal('100')
    return ((current - previous) / previous) * Decimal('100')


def get_status_display_map():
    field = Order._meta.get_field('status')
    if field.choices:
        return dict(field.choices)
    return {
        'new': 'Новые',
        'processing': 'В обработке',
        'delivered': 'Доставлено',
        'cancelled': 'Отменены',
    }


def get_site_visits_count(start_date, end_date):
    """
    Для настоящей конверсии нужен источник визитов/сессий.
    Подключи здесь свою модель аналитики, например:

        from analytics.models import SiteVisit
        return SiteVisit.objects.filter(created_at__date__gte=start_date, created_at__date__lte=end_date).count()

    Пока источника визитов нет, возвращаем 0, чтобы не показывать фейковую конверсию.
    """
    return 0


def build_week_chart(orders_qs, today):
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    rows = (
        orders_qs
        .filter(created_at__date__gte=week_start, created_at__date__lte=week_end)
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(count=Count('id'))
    )
    counts = {row['day']: row['count'] for row in rows}

    return [
        {
            'label': WEEK_LABELS[index],
            'count': counts.get(week_start + timedelta(days=index), 0),
        }
        for index in range(7)
    ]


def build_month_chart(orders_qs, today):
    month_start = today.replace(day=1)
    last_day = calendar.monthrange(today.year, today.month)[1]
    month_end = today.replace(day=last_day)

    rows = (
        orders_qs
        .filter(created_at__date__gte=month_start, created_at__date__lte=month_end)
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(count=Count('id'))
    )
    counts_by_day = {row['day'].day: row['count'] for row in rows}

    result = []
    week_number = 1
    for start_day in range(1, last_day + 1, 7):
        end_day = min(start_day + 6, last_day)
        count = sum(counts_by_day.get(day, 0) for day in range(start_day, end_day + 1))
        result.append({'label': f'{week_number} нед.', 'count': count})
        week_number += 1
    return result


def build_year_chart(orders_qs, today):
    year_start = today.replace(month=1, day=1)
    year_end = today.replace(month=12, day=31)

    rows = (
        orders_qs
        .filter(created_at__date__gte=year_start, created_at__date__lte=year_end)
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
    )
    counts = {row['month'].month: row['count'] for row in rows}

    return [
        {'label': MONTH_LABELS[month - 1], 'count': counts.get(month, 0)}
        for month in range(1, 13)
    ]


def build_status_chart(orders_qs):
    status_display_map = get_status_display_map()
    rows = orders_qs.values('status').annotate(count=Count('id'))
    counts = {row['status']: row['count'] for row in rows}

    result = []
    for status, label in status_display_map.items():
        result.append({
            'status': status,
            'label': label,
            'count': counts.get(status, 0),
            'color': STATUS_COLORS.get(status, '#4da6ff'),
        })
    return result


@login_required
def dashboard(request):
    User = get_user_model()
    today = timezone.localdate()
    month_start = today.replace(day=1)
    previous_month_end = month_start - timedelta(days=1)
    previous_month_start = previous_month_end.replace(day=1)

    orders_qs = Order.objects.select_related('user').all()

    current_month_orders = orders_qs.filter(
        created_at__date__gte=month_start,
        created_at__date__lte=today,
    )
    previous_month_orders = orders_qs.filter(
        created_at__date__gte=previous_month_start,
        created_at__date__lte=previous_month_end,
    )

    all_orders_count = orders_qs.count()
    current_month_orders_count = current_month_orders.count()
    previous_month_orders_count = previous_month_orders.count()

    month_revenue = current_month_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    previous_month_revenue = previous_month_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')

    site_visits_count = get_site_visits_count(month_start, today)
    previous_site_visits_count = get_site_visits_count(previous_month_start, previous_month_end)

    conversion_rate = Decimal('0')
    previous_conversion_rate = Decimal('0')
    if site_visits_count > 0:
        conversion_rate = Decimal(current_month_orders_count) / Decimal(site_visits_count) * Decimal('100')
    if previous_site_visits_count > 0:
        previous_conversion_rate = Decimal(previous_month_orders_count) / Decimal(previous_site_visits_count) * Decimal('100')

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

        'current_day': today.day,
        'current_month': MONTH_LABELS[today.month - 1],
        'current_year': today.year,
        'orders': orders_qs.order_by('-created_at')[:10],
        'products_for_order': get_products_for_order(),
        'customers': User.objects.filter(is_active=True).order_by('username')[:200],
        'all_orders_count': all_orders_count,
        'month_revenue': month_revenue,
        'orders_month_delta': percent_delta(current_month_orders_count, previous_month_orders_count),
        'revenue_month_delta': percent_delta(month_revenue, previous_month_revenue),
        'site_visits_count': site_visits_count,
        'conversion_rate': conversion_rate,
        'conversion_delta': conversion_rate - previous_conversion_rate,
        'active_campaigns_count': 0,  # Подключи модель кампаний, если она есть.
        'orders_chart_data': {
            'week': build_week_chart(orders_qs, today),
            'month': build_month_chart(orders_qs, today),
            'year': build_year_chart(orders_qs, today),
        },
        'status_chart_data': build_status_chart(orders_qs),
    }

    return render(request, "dashboard/dashboard.html", context)

@login_required
def order_json(request, order_id):
    order = get_object_or_404(Order.objects.select_related('user'), pk=order_id)
    return JsonResponse({
        'id': order.id,
        'user': order.user.get_full_name() or order.user.username,
        'status': order.get_status_display(),
        'status_value': order.status,
        'total': str(order.total_amount),
        'product': getattr(order, 'first_product', '') or '—',
        'created_at': timezone.localtime(order.created_at).strftime('%d.%m.%Y %H:%M'),
    })


@login_required
@require_http_methods(['PATCH'])
def update_order_status(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    payload = json.loads(request.body.decode('utf-8') or '{}')
    new_status = payload.get('status')

    allowed_statuses = {value for value, _label in Order._meta.get_field('status').choices}
    if allowed_statuses and new_status not in allowed_statuses:
        return JsonResponse({'success': False, 'error': 'Некорректный статус'}, status=400)

    order.status = new_status
    order.save(update_fields=['status'])

    return JsonResponse({
        'success': True,
        'status': order.get_status_display(),
        'status_value': order.status,
    })


@login_required
@require_POST
def create_order_json(request):
    User = get_user_model()

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Некорректный JSON'
        }, status=400)

    user_id = payload.get('user_id')
    product_id = payload.get('product_id')
    status_value = payload.get('status') or 'new'
    quantity = payload.get('quantity') or 1

    if not user_id:
        return JsonResponse({
            'success': False,
            'error': 'Не выбран клиент'
        }, status=400)

    if not product_id:
        return JsonResponse({
            'success': False,
            'error': 'Не выбран товар'
        }, status=400)

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return JsonResponse({
            'success': False,
            'error': 'Некорректное количество товара'
        }, status=400)

    if quantity <= 0:
        return JsonResponse({
            'success': False,
            'error': 'Количество товара должно быть больше 0'
        }, status=400)

    customer = get_object_or_404(User, pk=user_id)
    product = get_object_or_404(Product, pk=product_id, is_active=True)

    if product.stock < quantity:
        return JsonResponse({
            'success': False,
            'error': f'На складе доступно только {product.stock} шт.'
        }, status=400)

    allowed_statuses = {
        value for value, _label in Order._meta.get_field('status').choices
    }

    if allowed_statuses and status_value not in allowed_statuses:
        return JsonResponse({
            'success': False,
            'error': 'Некорректный статус'
        }, status=400)

    total_amount = product.price * quantity

    order = Order.objects.create(
        user=customer,
        status=status_value,
        total_amount=total_amount,
    )

    OrderItem.objects.create(
        order=order,
        product=product,
        quantity=quantity,
        price=product.price,
    )

    product.stock -= quantity
    product.save(update_fields=['stock'])

    return JsonResponse({
        'success': True,
        'order': {
            'id': order.id,
            'user': customer.get_full_name() or customer.username,
            'status': order.get_status_display(),
            'status_value': order.status,
            'total': order.total_amount,
            'product': product.name,
            'quantity': quantity,
            'created_at': timezone.localtime(order.created_at).strftime('%d.%m.%Y %H:%M'),
        },
    }, status=201)


@login_required
def order_json(request, order_id):
    order = get_object_or_404(
        Order.objects
        .select_related('user')
        .prefetch_related('items__product'),
        pk=order_id
    )

    first_item = order.items.first()

    product_name = '—'
    if first_item and first_item.product:
        product_name = first_item.product.name

        if first_item.quantity > 1:
            product_name = f'{product_name} x{first_item.quantity}'

    return JsonResponse({
        'id': order.id,
        'user': order.user.get_full_name() or order.user.username,
        'status': order.get_status_display(),
        'status_value': order.status,
        'total': str(order.total_amount),
        'product': product_name,
        'created_at': timezone.localtime(order.created_at).strftime('%d.%m.%Y %H:%M'),
    })