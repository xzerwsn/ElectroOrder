import json
from datetime import date
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.views.decorators.http import require_POST, require_http_methods

from dashboard.models import Order, OrderItem, Product
from dashboard.views import MONTH_LABELS, build_orders_page_context, percent_delta

from .models import Campaign


CAMPAIGN_STATUS_COLORS = {
    "draft": "#94a3b8",
    "active": "#34d399",
    "paused": "#fbbf24",
    "completed": "#4da6ff",
}


def format_period_label(period):
    if period == "week":
        return "7 дней"
    if period == "month":
        return "30 дней"
    return "90 дней"


def get_period_start(today, period):
    days = {"week": 6, "month": 29, "quarter": 89}.get(period, 29)
    return today - timedelta(days=days)


def build_campaign_chart(campaigns):
    labels = []
    spent = []
    revenue = []

    for campaign in campaigns[:6]:
        labels.append(campaign.name[:16])
        spent.append(campaign.spent)
        revenue.append(campaign.revenue)

    return {"labels": labels, "spent": spent, "revenue": revenue}


def build_orders_timeline(period):
    today = timezone.localdate()
    start_date = get_period_start(today, period)

    rows = (
        Order.objects.filter(created_at__date__gte=start_date, created_at__date__lte=today)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(
            revenue=Sum("total_amount"),
            orders=Count("id"),
        )
        .order_by("day")
    )
    row_map = {row["day"]: row for row in rows}

    labels = []
    revenue = []
    orders = []
    cursor = start_date
    while cursor <= today:
        row = row_map.get(cursor, {})
        labels.append(cursor.strftime("%d.%m"))
        revenue.append(int(row.get("revenue") or 0))
        orders.append(int(row.get("orders") or 0))
        cursor += timedelta(days=1)

    return {"labels": labels, "revenue": revenue, "orders": orders}


def build_status_breakdown(campaigns):
    counts = {item["status"]: item["count"] for item in campaigns.values("status").annotate(count=Count("id"))}
    return [
        {
            "status": status,
            "label": label,
            "count": counts.get(status, 0),
            "color": CAMPAIGN_STATUS_COLORS.get(status, "#4da6ff"),
        }
        for status, label in Campaign.STATUS_CHOICES
    ]


def build_top_products(period):
    today = timezone.localdate()
    start_date = get_period_start(today, period)

    items = (
        OrderItem.objects.filter(order__created_at__date__gte=start_date, order__created_at__date__lte=today)
        .values("product__name")
        .annotate(
            units=Sum("quantity"),
            revenue=Sum("order__total_amount"),
        )
        .order_by("-units", "-revenue")[:5]
    )

    return list(items)


def build_channel_breakdown(campaigns):
    rows = campaigns.values("channel").annotate(
        campaigns_count=Count("id"),
        spent=Sum("spent"),
        revenue=Sum("revenue"),
        leads=Sum("leads"),
    )
    channel_labels = dict(Campaign.CHANNEL_CHOICES)
    result = []
    for row in rows:
        spent = int(row["spent"] or 0)
        revenue = int(row["revenue"] or 0)
        leads = int(row["leads"] or 0)
        result.append(
            {
                "channel": row["channel"],
                "label": channel_labels.get(row["channel"], row["channel"]),
                "campaigns_count": row["campaigns_count"],
                "spent": spent,
                "revenue": revenue,
                "leads": leads,
                "roas": round((revenue / spent), 2) if spent else 0,
            }
        )
    return result


def get_ads_summary_context(period="month"):
    today = timezone.localdate()
    start_date = get_period_start(today, period)
    previous_end = start_date - timedelta(days=1)
    previous_start = previous_end - (today - start_date)

    campaigns = Campaign.objects.all()
    active_campaigns = campaigns.filter(status="active")
    current_orders = Order.objects.filter(created_at__date__gte=start_date, created_at__date__lte=today)
    previous_orders = Order.objects.filter(created_at__date__gte=previous_start, created_at__date__lte=previous_end)

    spent_total = campaigns.aggregate(total=Sum("spent"))["total"] or 0
    previous_spent_total = 0
    revenue_total = campaigns.aggregate(total=Sum("revenue"))["total"] or 0
    leads_total = campaigns.aggregate(total=Sum("leads"))["total"] or 0
    clicks_total = campaigns.aggregate(total=Sum("clicks"))["total"] or 0
    impressions_total = campaigns.aggregate(total=Sum("impressions"))["total"] or 0
    conversions_total = campaigns.aggregate(total=Sum("conversions"))["total"] or 0

    orders_count = current_orders.count()
    previous_orders_count = previous_orders.count()
    orders_revenue = current_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
    previous_orders_revenue = previous_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

    ctr = (clicks_total / impressions_total * 100) if impressions_total else 0
    conversion_rate = (conversions_total / clicks_total * 100) if clicks_total else 0
    cpl = spent_total / leads_total if leads_total else 0
    roas = revenue_total / spent_total if spent_total else 0
    average_check = orders_revenue / orders_count if orders_count else 0
    previous_average_check = previous_orders_revenue / previous_orders_count if previous_orders_count else 0

    return {
        "selected_period": period,
        "period_label": format_period_label(period),
        "campaigns": campaigns,
        "active_campaigns": active_campaigns,
        "campaigns_count": campaigns.count(),
        "active_campaigns_count": active_campaigns.count(),
        "spent_total": spent_total,
        "revenue_total": revenue_total,
        "leads_total": leads_total,
        "clicks_total": clicks_total,
        "impressions_total": impressions_total,
        "conversions_total": conversions_total,
        "orders_count": orders_count,
        "orders_revenue": orders_revenue,
        "ctr": ctr,
        "conversion_rate": conversion_rate,
        "cpl": cpl,
        "roas": roas,
        "average_check": average_check,
        "spent_delta": percent_delta(spent_total, previous_spent_total),
        "orders_delta": percent_delta(orders_count, previous_orders_count),
        "revenue_delta": percent_delta(orders_revenue, previous_orders_revenue),
        "average_check_delta": percent_delta(average_check, previous_average_check),
        "campaign_chart_data": build_campaign_chart(list(campaigns.order_by("-revenue", "-spent"))),
        "campaign_status_data": build_status_breakdown(campaigns),
        "orders_timeline_data": build_orders_timeline(period),
        "top_products": build_top_products(period),
        "channel_breakdown": build_channel_breakdown(campaigns),
        "campaign_channels": Campaign.CHANNEL_CHOICES,
        "campaign_statuses": Campaign.STATUS_CHOICES,
        "products_for_promo": Product.objects.filter(is_active=True).order_by("name")[:8],
        "month_label": MONTH_LABELS[today.month - 1],
        "current_year": today.year,
    }


@login_required
def advert(request):
    period = request.GET.get("period") or "month"
    context = build_orders_page_context()
    context.update(get_ads_summary_context(period))
    context.update(
        {
            "title": "Реклама",
            "page_title": "Рекламные кампании",
            "page_subtitle": "Управление бюджетами, лидами и эффективностью каналов продаж",
            "active_page": "advert",
        }
    )
    return render(request, "ads/advert.html", context)


@login_required
def analysis(request):
    period = request.GET.get("period") or "month"
    context = build_orders_page_context()
    context.update(get_ads_summary_context(period))
    context.update(
        {
            "title": "Аналитика",
            "page_title": "Аналитика продаж и маркетинга",
            "page_subtitle": "Сводка по выручке, заказам, среднему чеку и эффективности каналов",
            "active_page": "analysis",
        }
    )
    return render(request, "ads/analysis.html", context)


@login_required
@require_POST
def create_campaign_json(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Некорректный JSON"}, status=400)

    name = (payload.get("name") or "").strip()
    channel = payload.get("channel")
    budget = payload.get("budget")
    start_date = payload.get("start_date")
    description = (payload.get("description") or "").strip()
    seed_product = payload.get("seed_product")

    if not name:
        return JsonResponse({"success": False, "error": "Введите название кампании"}, status=400)
    if channel not in {value for value, _label in Campaign.CHANNEL_CHOICES}:
        return JsonResponse({"success": False, "error": "Выберите корректный канал"}, status=400)
    if Campaign.objects.filter(name__iexact=name).exists():
        return JsonResponse({"success": False, "error": "Кампания с таким названием уже существует"}, status=400)

    try:
        budget = int(budget)
    except (TypeError, ValueError):
        return JsonResponse({"success": False, "error": "Бюджет должен быть числом"}, status=400)

    if budget < 0:
        return JsonResponse({"success": False, "error": "Бюджет не может быть отрицательным"}, status=400)

    if not start_date:
        return JsonResponse({"success": False, "error": "Укажите дату запуска"}, status=400)

    try:
        start_date = date.fromisoformat(start_date)
    except ValueError:
        return JsonResponse({"success": False, "error": "Некорректная дата запуска"}, status=400)

    initial_spent = min(budget, max(0, budget // 3))
    initial_impressions = max(0, budget * 9)
    initial_clicks = max(0, budget // 18)
    initial_leads = max(0, initial_clicks // 4)
    initial_conversions = max(0, initial_leads // 2)
    average_order_total = Order.objects.aggregate(total=Sum("total_amount"))["total"] or 15000
    estimated_revenue = initial_conversions * int(average_order_total)

    if seed_product:
        description = f"{description}\nФокус: {seed_product}".strip()

    campaign = Campaign.objects.create(
        name=name,
        channel=channel,
        status="active",
        budget=budget,
        spent=initial_spent,
        impressions=initial_impressions,
        clicks=initial_clicks,
        leads=initial_leads,
        conversions=initial_conversions,
        revenue=estimated_revenue,
        start_date=start_date,
        description=description,
    )

    return JsonResponse(
        {
            "success": True,
            "campaign": {
                "id": campaign.id,
                "name": campaign.name,
                "channel": campaign.get_channel_display(),
                "status": campaign.get_status_display(),
                "status_value": campaign.status,
                "budget": campaign.budget,
                "spent": campaign.spent,
                "leads": campaign.leads,
                "revenue": campaign.revenue,
            },
        },
        status=201,
    )


@login_required
@require_http_methods(["PATCH"])
def update_campaign_status_json(request, campaign_id):
    campaign = get_object_or_404(Campaign, pk=campaign_id)

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Некорректный JSON"}, status=400)

    status_value = payload.get("status")
    allowed_statuses = {value for value, _label in Campaign.STATUS_CHOICES}
    if status_value not in allowed_statuses:
        return JsonResponse({"success": False, "error": "Некорректный статус"}, status=400)

    campaign.status = status_value
    if status_value == "completed" and not campaign.end_date:
        campaign.end_date = timezone.localdate()
        campaign.save(update_fields=["status", "end_date", "updated_at"])
    else:
        campaign.save(update_fields=["status", "updated_at"])

    return JsonResponse(
        {
            "success": True,
            "campaign": {
                "id": campaign.id,
                "status": campaign.get_status_display(),
                "status_value": campaign.status,
            },
        }
    )
