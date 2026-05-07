from django.urls import path

from . import views

app_name = "market"

urlpatterns = [
    path("", views.home, name="home"),
    path("catalog/", views.catalog, name="catalog"),
    path("login/", views.MarketLoginView.as_view(), name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.MarketLogoutView.as_view(), name="logout"),
    path("profile/", views.profile_view, name="profile"),
    path("profile/update/", views.update_profile, name="update_profile"),
    path("product/<int:product_id>/", views.product_detail, name="product_detail"),
    path("cart/", views.cart_view, name="cart"),
    path("checkout/", views.checkout, name="checkout"),
    path("checkout/place-order/", views.place_order, name="place_order"),
    path("order-success/<int:order_id>/", views.order_success, name="order_success"),
    path("product/<int:product_id>/add/", views.add_to_cart, name="add_to_cart"),
    path("cart/<int:product_id>/update/", views.update_cart_item, name="update_cart_item"),
    path("cart/<int:product_id>/remove/", views.remove_from_cart, name="remove_from_cart"),
]
