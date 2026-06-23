from django.shortcuts import render

def orders(request):

    context = {
        "title": "Управление заказами",
    }

    return render(request, 'orders/orders.html', context)