from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include('market.urls')),
    path("market/", RedirectView.as_view(url="/", permanent=False)),
    path("crm/", include('dashboard.urls')),
    path("orders/", include('orders.urls')),
    path("advertisement/", include('ads.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

