from django.urls import path
from . import views

app_name = "dashboard"

urlpatterns = [
    path("", views.dashboard, name='dashboard'),
    path('orders/', views.orders, name='orders'),
    path('orders/create/json/', views.create_order_json, name='create_order_json'),
    path('orders/<int:order_id>/json/', views.order_json, name='order_detail_json'),
    path('orders/<int:order_id>/update-status/', views.update_order_status, name='update_order_status'),
   ]