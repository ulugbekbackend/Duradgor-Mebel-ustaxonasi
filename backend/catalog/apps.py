from django.apps import AppConfig


class CatalogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "catalog"
    verbose_name = "Katalog"

    def ready(self):
        """Media fayllarni avtomatik tozalash signallarini ulash (core.mixins)."""
        from core.mixins import connect_media_cleanup_signals

        from catalog.models import Product, ProductImage

        connect_media_cleanup_signals(Product, field_names=("cover",))
        connect_media_cleanup_signals(ProductImage, field_names=("image",))
