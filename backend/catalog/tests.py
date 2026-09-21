"""Katalog API testlari: ro'yxat, qidiruv, kategoriya filtri, sahifalash."""
from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product


class CatalogApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.living = Category.objects.create(name="Mehmonxona", slug="living")
        cls.sofas = Category.objects.create(name="Divanlar", slug="sofas", parent=cls.living)
        cls.beds_cat = Category.objects.create(name="Karavotlar", slug="beds")

        cls.sofa = Product.objects.create(
            category=cls.sofas, name="Osaka divani", slug="osaka-divani",
            description="yashil divan", price=Decimal("6900000"), material="beech",
            width=220, depth=95, height=85, stock=4, status="in_stock",
        )
        cls.bed = Product.objects.create(
            category=cls.beds_cat, name="Orzu karavoti", slug="orzu-karavoti",
            description="yotoq uchun", price=Decimal("7200000"), material="velour",
            width=175, depth=215, height=118, stock=0, status="on_order",
        )

    def test_product_list_returns_paginated_structure(self):
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertIn("count", response.data)
        self.assertEqual(response.data["count"], 2)

    def test_search_by_name(self):
        response = self.client.get(reverse("product-list"), {"q": "osaka"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], "osaka-divani")

    def test_category_filter_includes_children(self):
        # 'living' ota kategoriya — bolasi 'sofas' mahsuloti ham chiqishi kerak
        response = self.client.get(reverse("product-list"), {"category": "living"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], "osaka-divani")

    def test_price_range_filter(self):
        response = self.client.get(
            reverse("product-list"), {"price_min": "7000000", "price_max": "8000000"}
        )
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], "orzu-karavoti")

    def test_ordering_by_price(self):
        response = self.client.get(reverse("product-list"), {"ordering": "price"})
        slugs = [r["slug"] for r in response.data["results"]]
        self.assertEqual(slugs, ["osaka-divani", "orzu-karavoti"])

    def test_category_list_contains_parent_child_relation(self):
        response = self.client.get(reverse("category-list"))
        sofas = next(c for c in response.data if c["slug"] == "sofas")
        self.assertEqual(sofas["parent"], "living")
        living = next(c for c in response.data if c["slug"] == "living")
        self.assertIn("sofas", living["children"])

    def test_list_contains_translations_and_variants(self):
        from .models import ProductVariant

        self.sofa.name_ru = "Диван «Осака»"
        self.sofa.material_label = "Buk, zig'ir"
        self.sofa.save()
        ProductVariant.objects.create(product=self.sofa, name="Yashil", name_ru="Зелёный", color_code="#6f7d5c")
        response = self.client.get(reverse("product-list"), {"q": "osaka"})
        item = response.data["results"][0]
        self.assertEqual(item["name_ru"], "Диван «Осака»")
        self.assertEqual(item["material_label"], "Buk, zig'ir")
        self.assertEqual(item["variants"][0]["name_ru"], "Зелёный")

    def test_featured_new_and_ids_filters(self):
        Product.objects.filter(pk=self.sofa.pk).update(is_featured=True)
        Product.objects.filter(pk=self.bed.pk).update(is_new=True)
        url = reverse("product-list")
        self.assertEqual([r["slug"] for r in self.client.get(url, {"is_featured": "true"}).data["results"]], ["osaka-divani"])
        self.assertEqual([r["slug"] for r in self.client.get(url, {"is_new": "true"}).data["results"]], ["orzu-karavoti"])
        both = self.client.get(url, {"ids": f"{self.sofa.pk},{self.bed.pk}"}).data
        self.assertEqual(both["count"], 2)
        self.assertEqual(self.client.get(url, {"ids": "1,abc"}).status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.client.get(url, {"is_new": "ha"}).status_code, status.HTTP_400_BAD_REQUEST)

    def test_unknown_category_returns_empty_list(self):
        response = self.client.get(reverse("product-list"), {"category": "yoq"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_invalid_filters_rejected(self):
        for params in ({"price_min": "abc"}, {"material": "plastik"}, {"status": "sold"}):
            response = self.client.get(reverse("product-list"), params)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, params)

    def test_products_count_on_categories(self):
        response = self.client.get(reverse("category-list"))
        sofas = next(c for c in response.data if c["slug"] == "sofas")
        self.assertEqual(sofas["products_count"], 1)


class SeedDemoTests(APITestCase):
    def test_seed_is_idempotent_and_new_rows_get_fresh_ids(self):
        from io import StringIO

        from django.core.management import call_command

        call_command("seed_demo", stdout=StringIO())
        call_command("seed_demo", stdout=StringIO())  # ikkinchi marta — dublikat bo'lmasligi kerak
        count = Product.objects.count()
        self.assertGreater(count, 0)
        osaka = Product.objects.get(slug="osaka-divani")
        self.assertTrue(osaka.name_ru and osaka.description_ru and osaka.material_label_ru)
        self.assertTrue(Category.objects.get(slug="sofas").name_ru)
        self.assertEqual(osaka.created_at.date().isoformat(), "2026-01-18")  # demo sanasi saqlanadi
        category = Category.objects.create(name="Yangi", slug="yangi")  # id to'qnashmasligi kerak
        self.assertGreater(category.pk, 12)
