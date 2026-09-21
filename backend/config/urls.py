"""Duradgor Mebel — URL konfiguratsiyasi."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from core.views import health
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    # API
    path("api/health/", health, name="health"),
    path("api/catalog/", include("catalog.urls")),
    path("api/orders/", include("orders.urls")),
    # API hujjatlari (drf-spectacular)
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:  # faqat development'da media/statik fayllarni Django tarqatadi
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = "Duradgor Mebel — boshqaruv"
admin.site.site_title = "Duradgor admin"
admin.site.index_title = "Katalog va buyurtmalar"
