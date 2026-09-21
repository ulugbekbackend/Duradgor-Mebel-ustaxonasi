"""
Media fayllarni avtomatik tozalash signallari uchun testlar.

Tekshiriladi:
1. post_delete — obyekt o'chirilganda fayl diskdan yo'qoladi;
2. pre_save — yangi rasm yuklanganda eski fayl diskdan yo'qoladi.

Ishga tushirish:  pytest  (backend papkasida)
"""
import tempfile
from io import BytesIO

from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

TEMP_MEDIA_ROOT = tempfile.mkdtemp(prefix="duradgor_test_media_")


def make_image_bytes(color=(18, 48, 36), size=(64, 64), fmt="PNG") -> bytes:
    buffer = BytesIO()
    Image.new("RGB", size, color).save(buffer, format=fmt)
    return buffer.getvalue()


def make_upload(name="test.png") -> SimpleUploadedFile:
    return SimpleUploadedFile(name, make_image_bytes(), content_type="image/png")


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT, CONVERT_MEDIA_TO_WEBP=False)
class MediaCleanupSignalTests(TestCase):
    """Product.cover va ProductImage.image maydonlari uchun signal testlari."""

    def _make_product(self, **kwargs):
        from catalog.models import Category, Product

        category = Category.objects.create(name="Test bo'lim", slug="test-bolim")
        return Product.objects.create(
            category=category,
            name="Signal test mahsuloti",
            slug=kwargs.pop("slug", "signal-test"),
            description="tavsif",
            price=1_000_000,
            material="beech",
            width=200,
            depth=90,
            height=80,
            cover=make_upload(),
            **kwargs,
        )

    # ---------------- post_delete ---------------- #
    def test_cover_file_deleted_when_product_deleted(self):
        from catalog.models import Product

        product = self._make_product()
        file_name = product.cover.name
        self.assertTrue(default_storage.exists(file_name))

        product.delete()
        self.assertEqual(Product.objects.count(), 0)
        self.assertFalse(
            default_storage.exists(file_name),
            "post_delete signal ishlamadi: fayl diskda qolib ketdi",
        )

    def test_image_file_deleted_when_productimage_deleted(self):
        from catalog.models import ProductImage

        product = self._make_product()
        pi = ProductImage.objects.create(product=product, image=make_upload())
        file_name = pi.image.name
        self.assertTrue(default_storage.exists(file_name))

        pi.delete()
        self.assertFalse(
            default_storage.exists(file_name),
            "ProductImage o'chirilganda fayl diskdan o'chirilmadi",
        )

    # ---------------- pre_save ---------------- #
    def test_old_cover_replaced_and_deleted_on_update(self):
        product = self._make_product()
        old_name = product.cover.name
        self.assertTrue(default_storage.exists(old_name))

        product.cover = make_upload("yangi.png")
        product.save()

        self.assertFalse(
            default_storage.exists(old_name),
            "pre_save signal ishlamadi: eski fayl diskda qolib ketdi",
        )
        product.refresh_from_db()
        self.assertTrue(default_storage.exists(product.cover.name))
        self.assertNotEqual(product.cover.name, old_name)

    def test_same_file_kept_when_no_change(self):
        product = self._make_product()
        file_name = product.cover.name

        product.name = "Faqat nom o'zgardi"  # rasm o'zgarmaydi
        product.save()

        self.assertTrue(
            default_storage.exists(file_name),
            "Rasm o'zgarmasa ham fayl o'chirilib ketdi — xato!",
        )
