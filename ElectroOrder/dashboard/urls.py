from django.urls import path
from . import views

app_name = "dashboard"

urlpatterns = [
    path("", views.dashboard, name='dashboard'),
    path('orders/', views.orders, name='orders'),
    path('products/', views.products, name='products'),
    path('settings/', views.settings_view, name='settings'),
    path('orders/create/json/', views.create_order_json, name='create_order_json'),
    path('products/create/json/', views.create_product_json, name='create_product_json'),
    path('products/<int:product_id>/json/', views.product_json, name='product_detail_json'),
    path('products/<int:product_id>/update/json/', views.update_product_json, name='update_product_json'),
    path('settings/profile/update/json/', views.update_profile_json, name='update_profile_json'),
    path('orders/<int:order_id>/json/', views.order_json, name='order_detail_json'),
    path('orders/<int:order_id>/update-status/', views.update_order_status, name='update_order_status'),
   ]
