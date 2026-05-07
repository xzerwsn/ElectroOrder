from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.contrib.auth.views import LoginView, LogoutView
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from dashboard.models import Order, OrderItem, Product
from .forms import MarketAuthenticationForm, MarketProfileForm, MarketRegistrationForm
from .models import MarketProfile


CART_SESSION_KEY = "market_cart"

CATEGORY_KEYWORDS = {
    "smartphones": ["iphone", "samsung", "xiaomi", "pixel", "galaxy", "smartphone", "смартфон"],
    "laptops": ["macbook", "laptop", "notebook", "lenovo", "asus", "hp", "ноутбук"],
    "audio": ["airpods", "headphone", "buds", "speaker", "jbl", "sony", "науш", "колонк"],
    "gaming": ["playstation", "xbox", "switch", "vr", "gaming", "гейм", "ps5"],
    "accessories": ["watch", "charger", "cable", "case", "keyboard", "mouse", "аксесс", "заряд"],
}

CATEGORY_TITLES = {
    "all": "Вся электроника",
    "smartphones": "Смартфоны",
    "laptops": "Ноутбуки",
    "audio": "Аудио",
    "gaming": "Гейминг",
    "accessories": "Аксессуары",
}


def detect_category(product_name):
    normalized = (product_name or "").lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return category
    return "accessories"


def serialize_product(product):
    return {
        "id": product.id,
        "name": product.name,
        "price": product.price or 0,
        "stock": product.stock or 0,
        "is_active": product.is_active,
        "category": detect_category(product.name),
        "badge": "В наличии" if (product.stock or 0) > 0 else "Под заказ",
        "subtitle": f"SKU-{product.id:05d}",
    }


def get_market_products():
    products = Product.objects.filter(is_active=True).order_by("name")
    return [serialize_product(product) for product in products]


def get_or_create_profile(user):
    profile, _created = MarketProfile.objects.get_or_create(user=user)
    return profile


def get_cart(request):
    return request.session.get(CART_SESSION_KEY, {})


def save_cart(request, cart):
    request.session[CART_SESSION_KEY] = cart
    request.session.modified = True


def get_cart_items(request):
    cart = get_cart(request)
    if not cart:
        return []

    product_ids = [int(product_id) for product_id in cart.keys()]
    products = Product.objects.filter(id__in=product_ids, is_active=True)
    products_map = {product.id: product for product in products}

    items = []
    for product_id, quantity in cart.items():
        product = products_map.get(int(product_id))
        if not product:
            continue

        serialized = serialize_product(product)
        safe_quantity = min(int(quantity), product.stock or 0) if (product.stock or 0) > 0 else 0
        items.append(
            {
                "product": serialized,
                "quantity": safe_quantity,
                "line_total": serialized["price"] * safe_quantity,
            }
        )
    return items


def build_cart_summary(request):
    items = get_cart_items(request)
    items_count = sum(item["quantity"] for item in items)
    subtotal = sum(item["line_total"] for item in items)
    delivery_fee = 0 if subtotal >= 50000 or subtotal == 0 else 990
    total = subtotal + delivery_fee

    return {
        "cart_items": items,
        "cart_items_count": items_count,
        "cart_subtotal": subtotal,
        "cart_delivery_fee": delivery_fee,
        "cart_total": total,
        "cart_is_empty": items_count == 0,
    }


def build_market_context(request):
    products = get_market_products()
    available_products = [product for product in products if product["stock"] > 0]

    categories = []
    for key, label in CATEGORY_TITLES.items():
        if key == "all":
            count = len(products)
        else:
            count = sum(1 for product in products if product["category"] == key)
        categories.append({"key": key, "label": label, "count": count})

    context = {
        "market_products": products,
        "market_categories": categories,
        "products_count": len(products),
        "available_count": len(available_products),
        "starting_price": min((product["price"] for product in products), default=0),
        "premium_price": max((product["price"] for product in products), default=0),
    }
    context.update(build_cart_summary(request))
    return context


class MarketLoginView(LoginView):
    template_name = "market/auth/login.html"
    authentication_form = MarketAuthenticationForm
    redirect_authenticated_user = True

    def get_success_url(self):
        return self.get_redirect_url() or "/"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(build_market_context(self.request))
        context.update(
            {
                "title": "Вход",
                "active_market_page": "login",
            }
        )
        return context


class MarketLogoutView(LogoutView):
    next_page = "/"


def register(request):
    if request.user.is_authenticated:
        return redirect("market:home")

    if request.method == "POST":
        form = MarketRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = form.cleaned_data["email"]
            user.first_name = form.cleaned_data["first_name"]
            user.last_name = form.cleaned_data["last_name"]
            user.save()
            get_or_create_profile(user)
            login(request, user)
            messages.success(request, "Аккаунт создан. Вы вошли в магазин.")
            return redirect("market:home")
    else:
        form = MarketRegistrationForm()

    context = build_market_context(request)
    context.update(
        {
            "title": "Регистрация",
            "active_market_page": "register",
            "form": form,
        }
    )
    return render(request, "market/auth/register.html", context)


def home(request):
    context = build_market_context(request)
    context.update(
        {
            "title": "ElectroOrder Market",
            "active_market_page": "home",
        }
    )
    return render(request, "market/home.html", context)


def catalog(request):
    query = (request.GET.get("q") or "").strip()
    category = request.GET.get("category") or "all"
    in_stock_only = request.GET.get("in_stock") == "1"

    products = Product.objects.filter(is_active=True)
    if query:
        products = products.filter(Q(name__icontains=query))

    serialized = [serialize_product(product) for product in products.order_by("name")]
    if category != "all":
        serialized = [product for product in serialized if product["category"] == category]
    if in_stock_only:
        serialized = [product for product in serialized if product["stock"] > 0]

    context = build_market_context(request)
    context.update(
        {
            "title": "Каталог",
            "active_market_page": "catalog",
            "catalog_products": serialized,
            "selected_category": category,
            "search_query": query,
            "in_stock_only": in_stock_only,
            "catalog_title": CATEGORY_TITLES.get(category, "Каталог"),
        }
    )
    return render(request, "market/catalog.html", context)


def product_detail(request, product_id):
    product = get_object_or_404(Product, pk=product_id, is_active=True)
    serialized_product = serialize_product(product)
    related_products = [
        item
        for item in get_market_products()
        if item["id"] != serialized_product["id"] and item["category"] == serialized_product["category"]
    ][:4]

    context = build_market_context(request)
    context.update(
        {
            "title": serialized_product["name"],
            "active_market_page": "catalog",
            "product": serialized_product,
            "related_products": related_products,
        }
    )
    return render(request, "market/product_detail.html", context)


def cart_view(request):
    context = build_market_context(request)
    context.update(
        {
            "title": "Корзина",
            "active_market_page": "cart",
        }
    )
    return render(request, "market/cart.html", context)


def checkout(request):
    context = build_market_context(request)
    if context["cart_is_empty"]:
        messages.info(request, "Корзина пуста. Добавьте товары перед оформлением заказа.")
        return redirect("market:catalog")

    profile = get_or_create_profile(request.user) if request.user.is_authenticated else None
    context.update(
        {
            "title": "Оформление заказа",
            "active_market_page": "checkout",
            "checkout_defaults": {
                "full_name": request.POST.get("full_name", request.user.get_full_name() if request.user.is_authenticated else ""),
                "email": request.POST.get("email", request.user.email if request.user.is_authenticated else ""),
                "phone": request.POST.get("phone", profile.phone if profile else ""),
                "city": request.POST.get("city", profile.city if profile else ""),
                "address": request.POST.get("address", profile.delivery_address if profile else ""),
                "payment_method": request.POST.get("payment_method", "card"),
            },
        }
    )
    return render(request, "market/checkout.html", context)


def order_success(request, order_id):
    order = get_object_or_404(Order.objects.prefetch_related("items__product"), pk=order_id)
    context = build_market_context(request)
    context.update(
        {
            "title": "Заказ оформлен",
            "active_market_page": "checkout",
            "success_order": order,
        }
    )
    return render(request, "market/order_success.html", context)


@require_POST
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, pk=product_id, is_active=True)
    quantity_raw = request.POST.get("quantity", "1")
    try:
        quantity = max(1, int(quantity_raw))
    except ValueError:
        return HttpResponseBadRequest("Некорректное количество")

    if product.stock <= 0:
        messages.error(request, f"{product.name} временно недоступен.")
        return redirect(request.POST.get("next") or "market:catalog")

    cart = get_cart(request)
    current_quantity = int(cart.get(str(product.id), 0))
    cart[str(product.id)] = min(product.stock, current_quantity + quantity)
    save_cart(request, cart)

    messages.success(request, f"{product.name} добавлен в корзину.")
    return redirect(request.POST.get("next") or "market:cart")


@require_POST
def update_cart_item(request, product_id):
    product = get_object_or_404(Product, pk=product_id, is_active=True)
    quantity_raw = request.POST.get("quantity", "1")
    try:
        quantity = int(quantity_raw)
    except ValueError:
        return HttpResponseBadRequest("Некорректное количество")

    cart = get_cart(request)
    if quantity <= 0:
        cart.pop(str(product.id), None)
        messages.info(request, f"{product.name} удалён из корзины.")
    else:
        cart[str(product.id)] = min(product.stock, quantity)
        messages.success(request, f"Количество для {product.name} обновлено.")
    save_cart(request, cart)
    return redirect("market:cart")


@require_POST
def remove_from_cart(request, product_id):
    product = get_object_or_404(Product, pk=product_id, is_active=True)
    cart = get_cart(request)
    cart.pop(str(product.id), None)
    save_cart(request, cart)
    messages.info(request, f"{product.name} удалён из корзины.")
    return redirect("market:cart")


def get_or_create_market_customer(full_name, email):
    User = get_user_model()
    if email:
        existing = User.objects.filter(email__iexact=email).first()
        if existing:
            return existing

    username_base = (email.split("@")[0] if email else "market-customer").strip().lower() or "market-customer"
    username_base = "".join(char if char.isalnum() or char in "-._" else "-" for char in username_base)[:120]
    username = username_base
    suffix = 1
    while User.objects.filter(username=username).exists():
        username = f"{username_base[:110]}-{suffix}"
        suffix += 1

    user = User.objects.create_user(username=username, email=email or "")
    user.set_unusable_password()
    if full_name:
        parts = [part for part in full_name.split() if part]
        user.first_name = parts[0] if parts else ""
        user.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
    user.save()
    get_or_create_profile(user)
    return user


@login_required
def profile_view(request):
    profile = get_or_create_profile(request.user)
    orders = (
        Order.objects.filter(user=request.user)
        .prefetch_related("items__product")
        .order_by("-created_at")
    )
    form = MarketProfileForm(instance=profile, user=request.user)

    context = build_market_context(request)
    context.update(
        {
            "title": "Профиль",
            "active_market_page": "account",
            "profile_form": form,
            "profile_orders": orders,
            "profile_data": {
                "full_name": request.user.get_full_name() or request.user.username,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "email": request.user.email,
                "phone": profile.phone,
                "city": profile.city,
                "delivery_address": profile.delivery_address,
            },
        }
    )
    return render(request, "market/profile.html", context)


@login_required
@require_POST
def update_profile(request):
    profile = get_or_create_profile(request.user)
    form = MarketProfileForm(request.POST, instance=profile, user=request.user)
    if form.is_valid():
        form.save()
        messages.success(request, "Профиль обновлён.")
    else:
        for field_errors in form.errors.values():
            for error in field_errors:
                messages.error(request, error)
    return redirect("market:profile")


@require_POST
@transaction.atomic
def place_order(request):
    summary = build_cart_summary(request)
    if summary["cart_is_empty"]:
        messages.error(request, "Корзина пуста.")
        return redirect("market:catalog")

    full_name = (request.POST.get("full_name") or "").strip()
    email = (request.POST.get("email") or "").strip()
    phone = (request.POST.get("phone") or "").strip()
    city = (request.POST.get("city") or "").strip()
    address = (request.POST.get("address") or "").strip()
    payment_method = (request.POST.get("payment_method") or "card").strip()

    if not all([full_name, email, phone, city, address]):
        messages.error(request, "Заполните все поля оформления заказа.")
        return redirect("market:checkout")

    customer = request.user if request.user.is_authenticated else get_or_create_market_customer(full_name, email)
    customer_profile = get_or_create_profile(customer)
    if full_name:
        parts = [part for part in full_name.split() if part]
        customer.first_name = parts[0] if parts else ""
        customer.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
    customer.email = email
    customer.save(update_fields=["first_name", "last_name", "email"])
    customer_profile.phone = phone
    customer_profile.city = city
    customer_profile.delivery_address = address
    customer_profile.save()

    locked_products = {
        product.id: product
        for product in Product.objects.select_for_update().filter(
            id__in=[item["product"]["id"] for item in summary["cart_items"]],
            is_active=True,
        )
    }
    for item in summary["cart_items"]:
        product = locked_products.get(item["product"]["id"])
        if not product or product.stock < item["quantity"]:
            messages.error(request, f"Недостаточно остатка для товара {item['product']['name']}.")
            return redirect("market:cart")

    order = Order.objects.create(
        user=customer,
        status="pending" if payment_method == "card" else "new",
        total_amount=summary["cart_total"],
    )

    for item in summary["cart_items"]:
        product = locked_products[item["product"]["id"]]

        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item["quantity"],
            price=product.price,
        )
        product.stock -= item["quantity"]
        product.save(update_fields=["stock"])

    order.calculate_total()
    save_cart(request, {})
    request.session["market_checkout_meta"] = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "city": city,
        "address": address,
        "payment_method": payment_method,
    }
    messages.success(request, "Оплата подтверждена, заказ оформлен.")
    return redirect("market:order_success", order_id=order.id)
