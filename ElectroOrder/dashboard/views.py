import calendar
import json
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.db.models import Count, OuterRef, Subquery, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.views.decorators.http import require_POST, require_http_methods

from .models import Order, OrderItem, Product


STATUS_COLORS = {
    "delivered": "#34d399",
    "pending": "#fbbf24",
    "new": "#4da6ff",
    "cancelled": "#f87171",
}

MONTH_LABELS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
WEEK_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]


def percent_delta(current, previous):
    current = Decimal(current or 0)
    previous = Decimal(previous or 0)
    if previous == 0:
        return Decimal("0") if current == 0 else Decimal("100")
    return ((current - previous) / previous) * Decimal("100")


def get_products_for_order():
    return list(
        Product.objects.filter(is_active=True)
        .order_by("name")
        .values("id", "name", "price", "stock")
    )


def get_site_visits_count(_start_date, _end_date):
    return 0


def build_week_chart(orders_qs, today):
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    rows = (
        orders_qs.filter(created_at__date__gte=week_start, created_at__date__lte=week_end)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
    )
    counts = {row["day"]: row["count"] for row in rows}

    return [
        {"label": WEEK_LABELS[index], "count": counts.get(week_start + timedelta(days=index), 0)}
        for index in range(7)
    ]


def build_month_chart(orders_qs, today):
    month_start = today.replace(day=1)
    last_day = calendar.monthrange(today.year, today.month)[1]
    month_end = today.replace(day=last_day)

    rows = (
        orders_qs.filter(created_at__date__gte=month_start, created_at__date__lte=month_end)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
    )
    counts_by_day = {row["day"].day: row["count"] for row in rows}

    result = []
    week_number = 1
    for start_day in range(1, last_day + 1, 7):
        end_day = min(start_day + 6, last_day)
        count = sum(counts_by_day.get(day, 0) for day in range(start_day, end_day + 1))
        result.append({"label": f"{week_number} нед.", "count": count})
        week_number += 1
    return result


def build_year_chart(orders_qs, today):
    year_start = today.replace(month=1, day=1)
    year_end = today.replace(month=12, day=31)

    rows = (
        orders_qs.filter(created_at__date__gte=year_start, created_at__date__lte=year_end)
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(count=Count("id"))
    )
    counts = {row["month"].month: row["count"] for row in rows}

    return [{"label": MONTH_LABELS[month - 1], "count": counts.get(month, 0)} for month in range(1, 13)]


def build_status_chart(orders_qs):
    status_display_map = dict(Order.STATUS_CHOICES)
    rows = orders_qs.values("status").annotate(count=Count("id"))
    counts = {row["status"]: row["count"] for row in rows}

    return [
        {
            "status": status,
            "label": label.strip(),
            "count": counts.get(status, 0),
            "color": STATUS_COLORS.get(status, "#4da6ff"),
        }
        for status, label in status_display_map.items()
    ]


def annotate_orders(queryset):
    first_item_subquery = (
        OrderItem.objects.filter(order=OuterRef("pk")).order_by("id").values("product__name")[:1]
    )
    total_items_subquery = (
        OrderItem.objects.filter(order=OuterRef("pk"))
        .values("order")
        .annotate(total=Sum("quantity"))
        .values("total")[:1]
    )

    return (
        queryset.annotate(
            first_product=Subquery(first_item_subquery),
            items_count=Subquery(total_items_subquery),
        )
        .select_related("user")
        .order_by("-created_at")
    )


def build_orders_page_context():
    today = timezone.localdate()
    month_start = today.replace(day=1)
    previous_month_end = month_start - timedelta(days=1)
    previous_month_start = previous_month_end.replace(day=1)

    base_orders_qs = Order.objects.all()
    annotated_orders = annotate_orders(base_orders_qs)

    current_month_orders = base_orders_qs.filter(created_at__date__gte=month_start, created_at__date__lte=today)
    previous_month_orders = base_orders_qs.filter(
        created_at__date__gte=previous_month_start,
        created_at__date__lte=previous_month_end,
    )

    all_orders_count = base_orders_qs.count()
    current_month_orders_count = current_month_orders.count()
    previous_month_orders_count = previous_month_orders.count()

    month_revenue = current_month_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
    previous_month_revenue = previous_month_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

    site_visits_count = get_site_visits_count(month_start, today)
    previous_site_visits_count = get_site_visits_count(previous_month_start, previous_month_end)

    conversion_rate = Decimal("0")
    previous_conversion_rate = Decimal("0")
    if site_visits_count > 0:
        conversion_rate = Decimal(current_month_orders_count) / Decimal(site_visits_count) * Decimal("100")
    if previous_site_visits_count > 0:
        previous_conversion_rate = Decimal(previous_month_orders_count) / Decimal(previous_site_visits_count) * Decimal("100")

    status_counts = {item["status"]: item["count"] for item in build_status_chart(base_orders_qs)}

    return {
        "current_day": today.day,
        "current_month": MONTH_LABELS[today.month - 1],
        "current_year": today.year,
        "orders": annotated_orders,
        "recent_orders": annotated_orders[:10],
        "products_for_order": get_products_for_order(),
        "customers": get_user_model().objects.filter(is_active=True).order_by("username")[:200],
        "all_orders_count": all_orders_count,
        "month_revenue": month_revenue,
        "orders_month_delta": percent_delta(current_month_orders_count, previous_month_orders_count),
        "revenue_month_delta": percent_delta(month_revenue, previous_month_revenue),
        "site_visits_count": site_visits_count,
        "conversion_rate": conversion_rate,
        "conversion_delta": conversion_rate - previous_conversion_rate,
        "active_campaigns_count": 0,
        "pending_count": status_counts.get("pending", 0),
        "delivered_count": status_counts.get("delivered", 0),
        "cancelled_count": status_counts.get("cancelled", 0),
        "orders_chart_data": {
            "week": build_week_chart(base_orders_qs, today),
            "month": build_month_chart(base_orders_qs, today),
            "year": build_year_chart(base_orders_qs, today),
        },
        "status_chart_data": build_status_chart(base_orders_qs),
        "order_statuses": Order.STATUS_CHOICES,
    }


def build_products_page_context():
    products = Product.objects.order_by("name")
    active_products = products.filter(is_active=True)
    low_stock_products = active_products.filter(stock__lte=5)
    total_stock_value = sum((product.price or 0) * (product.stock or 0) for product in active_products)

    return {
        "products": products,
        "products_count": products.count(),
        "active_products_count": active_products.count(),
        "low_stock_products_count": low_stock_products.count(),
        "inactive_products_count": products.filter(is_active=False).count(),
        "total_stock_value": total_stock_value,
    }


def build_settings_page_context(user):
    return {
        "settings_profile_name": user.get_full_name() or user.username,
        "settings_profile_email": user.email or "admin@electroorder.local",
        "settings_profile_role": "Администратор",
    }


def set_user_full_name(user, full_name):
    parts = [part for part in full_name.split() if part]
    user.first_name = parts[0] if parts else ""
    user.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""


@login_required
def dashboard(request):
    context = build_orders_page_context()
    context.update(
        {
            "title": "Дашборд",
            "page_title": f"Добро пожаловать, {request.user.get_full_name() or request.user.username} 👋",
            "page_subtitle": (
                f"Вот что происходит с вашим бизнесом сегодня, "
                f"{context['current_day']} {context['current_month']} {context['current_year']}"
            ),
            "active_page": "dashboard",
        }
    )
    return render(request, "dashboard/dashboard.html", context)


@login_required
def orders(request):
    context = build_orders_page_context()
    context.update(
        {
            "title": "Управление заказами",
            "page_title": "Управление заказами",
            "page_subtitle": "Все заказы системы • обновлено только что",
            "active_page": "orders",
        }
    )
    return render(request, "dashboard/orders.html", context)


@login_required
def products(request):
    context = build_orders_page_context()
    context.update(build_products_page_context())
    context.update(
        {
            "title": "Каталог товаров",
            "page_title": "Каталог товаров",
            "page_subtitle": "Управление ассортиментом электроники и складскими остатками",
            "active_page": "products",
        }
    )
    return render(request, "dashboard/products.html", context)


@login_required
def settings_view(request):
    context = build_orders_page_context()
    context.update(build_settings_page_context(request.user))
    context.update(
        {
            "title": "Настройки",
            "page_title": "Настройки",
            "page_subtitle": "Конфигурация системы и профиля",
            "active_page": "settings",
        }
    )
    return render(request, "dashboard/settings.html", context)


@login_required
def order_json(request, order_id):
    order = get_object_or_404(Order.objects.select_related("user").prefetch_related("items__product"), pk=order_id)
    first_item = order.items.first()
    product_name = "—"
    if first_item and first_item.product:
        product_name = first_item.product.name
        if first_item.quantity > 1:
            product_name = f"{product_name} x{first_item.quantity}"

    return JsonResponse(
        {
            "id": order.id,
            "user": order.user.get_full_name() or order.user.username,
            "status": order.get_status_display().strip(),
            "status_value": order.status,
            "total": str(order.total_amount),
            "product": product_name,
            "created_at": timezone.localtime(order.created_at).strftime("%d.%m.%Y %H:%M"),
        }
    )


@login_required
def product_json(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    return JsonResponse(
        {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "stock": product.stock,
            "is_active": product.is_active,
        }
    )


@login_required
@require_http_methods(["PATCH"])
def update_order_status(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    payload = json.loads(request.body.decode("utf-8") or "{}")
    new_status = payload.get("status")

    allowed_statuses = {value for value, _label in Order.STATUS_CHOICES}
    if new_status not in allowed_statuses:
        return JsonResponse({"success": False, "error": "Некорректный статус"}, status=400)

    order.status = new_status
    order.save(update_fields=["status"])

    return JsonResponse({"success": True, "status": order.get_status_display().strip(), "status_value": order.status})


@login_required
@require_http_methods(["PATCH"])
def update_product_json(request, product_id):
    product = get_object_or_404(Product, pk=product_id)

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Некорректный JSON"}, status=400)

    name = (payload.get("name") or "").strip()
    price = payload.get("price")
    stock = payload.get("stock")
    is_active = bool(payload.get("is_active", True))

    if not name:
        return JsonResponse({"success": False, "error": "Введите название товара"}, status=400)

    try:
        price = int(price)
        stock = int(stock)
    except (TypeError, ValueError):
        return JsonResponse({"success": False, "error": "Цена и остаток должны быть числами"}, status=400)

    if price < 0 or stock < 0:
        return JsonResponse({"success": False, "error": "Цена и остаток не могут быть отрицательными"}, status=400)

    if Product.objects.filter(name__iexact=name).exclude(pk=product.pk).exists():
        return JsonResponse({"success": False, "error": "Товар с таким названием уже существует"}, status=400)

    product.name = name
    product.price = price
    product.stock = stock
    product.is_active = is_active
    product.save()

    return JsonResponse(
        {
            "success": True,
            "product": {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "stock": product.stock,
                "is_active": product.is_active,
            },
        }
    )


@login_required
@require_POST
def create_order_json(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Некорректный JSON"}, status=400)

    user_id = payload.get("user_id")
    product_id = payload.get("product_id")
    status_value = payload.get("status") or "new"
    quantity = payload.get("quantity") or 1

    if not user_id:
        return JsonResponse({"success": False, "error": "Не выбран клиент"}, status=400)
    if not product_id:
        return JsonResponse({"success": False, "error": "Не выбран товар"}, status=400)

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return JsonResponse({"success": False, "error": "Некорректное количество товара"}, status=400)

    if quantity <= 0:
        return JsonResponse({"success": False, "error": "Количество товара должно быть больше 0"}, status=400)

    allowed_statuses = {value for value, _label in Order.STATUS_CHOICES}
    if status_value not in allowed_statuses:
        return JsonResponse({"success": False, "error": "Некорректный статус"}, status=400)

    customer = get_object_or_404(get_user_model(), pk=user_id)
    product = get_object_or_404(Product, pk=product_id, is_active=True)

    if product.stock < quantity:
        return JsonResponse({"success": False, "error": f"На складе доступно только {product.stock} шт."}, status=400)

    total_amount = product.price * quantity
    order = Order.objects.create(user=customer, status=status_value, total_amount=total_amount)
    OrderItem.objects.create(order=order, product=product, quantity=quantity, price=product.price)

    product.stock -= quantity
    product.save(update_fields=["stock"])

    return JsonResponse(
        {
            "success": True,
            "order": {
                "id": order.id,
                "user": customer.get_full_name() or customer.username,
                "status": order.get_status_display().strip(),
                "status_value": order.status,
                "total": order.total_amount,
                "product": product.name,
                "quantity": quantity,
                "created_at": timezone.localtime(order.created_at).strftime("%d.%m.%Y %H:%M"),
            },
        },
        status=201,
    )


@login_required
@require_POST
def create_product_json(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Некорректный JSON"}, status=400)

    name = (payload.get("name") or "").strip()
    price = payload.get("price")
    stock = payload.get("stock")
    is_active = bool(payload.get("is_active", True))

    if not name:
        return JsonResponse({"success": False, "error": "Введите название товара"}, status=400)

    try:
        price = int(price)
        stock = int(stock)
    except (TypeError, ValueError):
        return JsonResponse({"success": False, "error": "Цена и остаток должны быть числами"}, status=400)

    if price < 0:
        return JsonResponse({"success": False, "error": "Цена не может быть отрицательной"}, status=400)
    if stock < 0:
        return JsonResponse({"success": False, "error": "Остаток не может быть отрицательным"}, status=400)

    if Product.objects.filter(name__iexact=name).exists():
        return JsonResponse({"success": False, "error": "Товар с таким названием уже существует"}, status=400)

    product = Product.objects.create(name=name, price=price, stock=stock, is_active=is_active)

    return JsonResponse(
        {
            "success": True,
            "product": {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "stock": product.stock,
                "is_active": product.is_active,
            },
        },
        status=201,
    )


@login_required
@require_http_methods(["PATCH"])
def update_profile_json(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Некорректный JSON"}, status=400)

    full_name = (payload.get("full_name") or "").strip()
    email = (payload.get("email") or "").strip()

    if not full_name:
        return JsonResponse({"success": False, "error": "Введите имя"}, status=400)
    if not email:
        return JsonResponse({"success": False, "error": "Введите Email"}, status=400)

    request.user.email = email
    set_user_full_name(request.user, full_name)
    request.user.save(update_fields=["first_name", "last_name", "email"])

    return JsonResponse(
        {
            "success": True,
            "profile": {
                "full_name": request.user.get_full_name() or request.user.username,
                "email": request.user.email,
            },
        }
    )
