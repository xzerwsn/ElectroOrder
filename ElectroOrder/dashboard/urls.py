from django.urls import path
from . import views

app_name = "dashboard"

urlpatterns = [
    path("", views.dashboard, name='dashboard'),
    path('orders/<int:order_id>/json/', views.order_detail, name='order_detail_json'),
    path('orders/<int:order_id>/update-status/', views.update_order_status, name='update_order_status'),
   ]