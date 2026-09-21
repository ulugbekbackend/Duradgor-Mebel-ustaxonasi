"""
Media fayllarni avtomatik tozalash — UMUMIY, qayta ishlatiladigan mexanizm.

Har bir ImageField/FileField ishlatilgan modelda ikkita signal ishlashi kerak:

1. post_delete — obyekt o'chirilganda unga bog'liq fayl ham
   `storage.delete(...)` orqali diskdan o'chiriladi;
2. pre_save — obyekt yangilanayotganda (yangi rasm yuklanganda) bazadagi
   eski fayl yo'li olinadi va agar u yangi fayldan farq qilsa, eski fayl
   diskdan o'chiriladi (ishlatilmayotgan rasm xotirada qolib ketmaydi).

Bu logika har bir modelda qayta yozilmaydi — bitta funksiya barcha
media-modellarga ulanadi:

    # catalog/apps.py
    from core.mixins import connect_media_cleanup_signals

    class CatalogConfig(AppConfig):
        ...
        def ready(self):
            from catalog.models import Product, ProductImage
            connect_media_cleanup_signals(Product, field_names=("cover",))
            connect_media_cleanup_signals(ProductImage, field_names=("image",))

Yoki mixin orqali (model o'zi e'lon qiladi):

    class ProductImage(WebPMixin, MediaCleanupMixin, models.Model):
        media_cleanup_fields = ("image",)
        image = models.ImageField(upload_to="products/")
"""
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver


def connect_media_cleanup_signals(model_cls, field_names=("image",)):
    """Berilgan modelga media-tozalash signallarini ulaydi.

    :param model_cls: Django model klassi (masalan ProductImage)
    :param field_names: ImageField/FileField nomlari korteji
    """
    model_name = model_cls.__name__

    @receiver(pre_save, sender=model_cls, dispatch_uid=f"{model_name}_media_pre_save")
    def _delete_stale_files_on_update(sender, instance, **kwargs):
        """Yangi fayl yuklanganda eski faylni diskdan o'chirish."""
        if not instance.pk:
            return  # yangi obyekt — eski fayl yo'q
        try:
            old = sender._default_manager.get(pk=instance.pk)
        except sender.DoesNotExist:
            return
        for field_name in field_names:
            old_file = getattr(old, field_name)
            new_file = getattr(instance, field_name)
            old_name = old_file.name if old_file else None
            new_name = new_file.name if new_file else None
            if old_name and old_name != new_name:
                old_file.storage.delete(old_name)

    @receiver(post_delete, sender=model_cls, dispatch_uid=f"{model_name}_media_post_delete")
    def _delete_files_on_object_delete(sender, instance, **kwargs):
        """Obyekt o'chirilganda unga bog'liq fayllarni diskdan o'chirish."""
        for field_name in field_names:
            file_field = getattr(instance, field_name)
            if file_field and file_field.name:
                file_field.storage.delete(file_field.name)

    return model_cls


class MediaCleanupMixin:
    """Model klassiga `media_cleanup_fields` atributi orqali ulanadigan mixin.

    App'ning ready() ichida `MediaCleanupMixin.apply(model_cls)` chaqiriladi —
    klass atributidagi maydon ro'yxati asosida signallar ulanadi.
    """

    media_cleanup_fields: tuple = ("image",)

    @classmethod
    def apply(cls, model_cls):
        fields = getattr(model_cls, "media_cleanup_fields", ("image",))
        return connect_media_cleanup_signals(model_cls, field_names=fields)
