"""Demo katalogni bazaga yuklash: python manage.py seed_demo

Ma'lumotlar catalog/fixtures/demo_catalog.json dan olinadi — u frontend/src/data/catalog.js
dan hosil qilingan, shuning uchun id'lar (mahsulot, variant) frontend savati bilan bir xil.
Qayta ishga tushirish xavfsiz: mavjud yozuvlar id bo'yicha yangilanadi.
"""
import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.management.color import no_style
from django.db import connection, transaction
from django.utils.dateparse import parse_datetime

from catalog.models import Category, Product, ProductVariant

FIXTURE = Path(__file__).resolve().parents[2] / "fixtures" / "demo_catalog.json"


class Command(BaseCommand):
    help = "Demo kategoriya va mahsulotlarni yuklaydi (frontend demo katalogi bilan bir xil)."

    @transaction.atomic
    def handle(self, *args, **options):
        data = json.loads(FIXTURE.read_text(encoding="utf-8"))

        categories = {}
        # Avval ota kategoriyalar, keyin bolalari
        for item in sorted(data["categories"], key=lambda c: c["parent"] is not None):
            categories[item["slug"]], _ = Category.objects.update_or_create(
                pk=item["id"],
                defaults={
                    "slug": item["slug"],
                    "name": item["name"],
                    "name_ru": item["name_ru"],
                    "parent": categories.get(item["parent"]),
                },
            )

        for item in data["products"]:
            variants = item.pop("variants")
            item["category"] = categories[item.pop("category")]
            created_at = item.pop("created_at")
            product, _ = Product.objects.update_or_create(pk=item.pop("id"), defaults=item)
            # auto_now_add qo'lda berilgan sanani e'tiborsiz qoldiradi — "yangi" tartibi demo bilan bir xil bo'lsin
            Product.objects.filter(pk=product.pk).update(created_at=parse_datetime(f"{created_at}T12:00:00+05:00"))
            for variant in variants:
                ProductVariant.objects.update_or_create(
                    pk=variant.pop("id"), defaults={**variant, "product": product}
                )

        # id'lar qo'lda berildi — PostgreSQL sequence'larini surib qo'yamiz,
        # aks holda admin'dan qo'shilgan keyingi yozuv mavjud id bilan to'qnashadi
        with connection.cursor() as cursor:
            for sql in connection.ops.sequence_reset_sql(no_style(), [Category, Product, ProductVariant]):
                cursor.execute(sql)

        self.stdout.write(
            self.style.SUCCESS(
                f"{len(data['categories'])} kategoriya, {len(data['products'])} mahsulot yuklandi."
            )
        )
