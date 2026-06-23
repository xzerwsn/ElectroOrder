from django.urls import path

from . import views

app_name = "ads"

urlpatterns = [
    path("", views.advert, name="advert"),
    path("analytics/", views.analysis, name="analysis"),
    path("campaigns/create/json/", views.create_campaign_json, name="create_campaign_json"),
    path(
        "campaigns/<int:campaign_id>/status/json/",
        views.update_campaign_status_json,
        name="update_campaign_status_json",
    ),
]
