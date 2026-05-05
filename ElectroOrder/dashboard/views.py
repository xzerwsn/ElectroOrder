from django.shortcuts import render
from django.views.generic import DetailView, ListView, TemplateView
from django.utils import timezone

# Create your views here.
def dashboard(request):

    now = timezone.now()

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

        'current_year': now.year,

        "current_month": months[now.month],

        "current_day": now.day,
    }

    return render(request, "dashboard/dashboard.html", context)
