"""Buyurtma API testlari: yaratish, validatsiya, stok, jami summa."""
from decimal import Decimal

from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Category, Product
from core.utils import send_telegram_order_notification


def make_product(name="Test divan", price="1000000.00", stock=5, slug="test-divan"):
    category, _ = Category.objects.get_or_create(name="Test", slug="test")
    return Product.objects.create(
        category=category,
        name=name,
        slug=slug,
        description="tavsif",
        price=Decimal(price),
        material="beech",
        width=200,
        depth=90,
        height=80,
        stock=stock,
        status="in_stock",
    )


class OrderCreateApiTests(APITestCase):
    def setUp(self):
        cache.clear()  # buyurtma throttle hisoblagichi testlar orasida o'tib ketmasin

    def _payload(self, product_id, quantity=2):
        return {
            "full_name": "Aziz Karimov",
            "phone": "+998 90 123 45 67",
            "address": "Toshkent, Chilonzor-9, 4-uy",
            "comment": "Soat 15:00 dan keyin qulay",
            "payment_method": "cash",
            "items": [{"product": product_id, "quantity": quantity}],
        }

    def test_order_created_with_total_and_number(self):
        product = make_product()
        url = reverse("order-list")
        response = self.client.post(url, self._payload(product.id), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["order_number"].startswith("DG-"))
        self.assertEqual(response.data["payment_status"], "pending")

        order = product.category.products.first().category.products.first()  # noqa: F841
        from orders.models import Order

        order = Order.objects.get()
        self.assertEqual(order.total, Decimal("2000000.00"))  # 1 000 000 × 2
        self.assertEqual(order.items.count(), 1)

    def test_stock_decreases_after_order(self):
        product = make_product(stock=5)
        self.client.post(reverse("order-list"), self._payload(product.id, quantity=2), format="json")
        product.refresh_from_db()
        self.assertEqual(product.stock, 3)

    def test_invalid_phone_rejected(self):
        product = make_product()
        payload = self._payload(product.id)
        payload["phone"] = "abc"
        response = self.client.post(reverse("order-list"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_quantity_more_than_stock_rejected(self):
        product = make_product(stock=2)
        response = self.client.post(
            reverse("order-list"), self._payload(product.id, quantity=9), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_telegram_function_silent_without_settings(self):
        """Telegram sozlanmagan bo'lsa xato bermaydi (False qaytaradi)."""
        from orders.models import Order

        product = make_product()
        self.client.post(reverse("order-list"), self._payload(product.id), format="json")
        order = Order.objects.get()
        # TELEGRAM_BOT_TOKEN testlarda bo'sh — xato chiqmasligi kerak
        self.assertFalse(send_telegram_order_notification(order))


class OrderRulesTests(APITestCase):
    def setUp(self):
        cache.clear()

    def _payload(self, items, phone="+998 90 123 45 67", address="Toshkent, Chilonzor-9"):
        return {"full_name": "Aziz Karimov", "phone": phone, "address": address, "items": items}

    def test_variant_price_delta_and_snapshot(self):
        from catalog.models import ProductVariant
        from orders.models import OrderItem

        product = make_product(price="1000000.00")
        variant = ProductVariant.objects.create(product=product, name="Velur", price_delta=Decimal("250000"))
        response = self.client.post(
            reverse("order-list"),
            self._payload([{"product": product.id, "variant": variant.id, "quantity": 2}]),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = OrderItem.objects.get()
        self.assertEqual(item.variant_name, "Velur")
        self.assertEqual(item.price, Decimal("1250000.00"))
        self.assertEqual(response.data["total"], Decimal("2500000.00"))

    def test_variant_of_other_product_rejected(self):
        from catalog.models import ProductVariant

        product = make_product()
        other = make_product(name="Boshqa", slug="boshqa")
        variant = ProductVariant.objects.create(product=other, name="Qizil")
        response = self.client.post(
            reverse("order-list"),
            self._payload([{"product": product.id, "variant": variant.id, "quantity": 1}]),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_same_product_in_several_lines_checked_against_total_stock(self):
        product = make_product(stock=3)
        items = [{"product": product.id, "quantity": 2}, {"product": product.id, "quantity": 2}]
        response = self.client.post(reverse("order-list"), self._payload(items), format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        product.refresh_from_db()
        self.assertEqual(product.stock, 3)

    def test_repeat_customer_reused_and_old_address_kept(self):
        from orders.models import Customer, Order

        product = make_product()
        item = [{"product": product.id, "quantity": 1}]
        self.client.post(reverse("order-list"), self._payload(item, address="Eski manzil"), format="json")
        self.client.post(
            reverse("order-list"),
            self._payload(item, phone="+998(90)123-45-67", address="Yangi manzil"),
            format="json",
        )
        self.assertEqual(Customer.objects.count(), 1)
        self.assertEqual(Customer.objects.get().phone, "+998901234567")
        self.assertEqual(
            list(Order.objects.order_by("id").values_list("address", flat=True)),
            ["Eski manzil", "Yangi manzil"],
        )

    def test_orders_cannot_be_read_via_public_api(self):
        product = make_product()
        response = self.client.post(
            reverse("order-list"), self._payload([{"product": product.id, "quantity": 1}]), format="json"
        )
        detail = self.client.get(f"/api/orders/{response.data['id']}/")
        self.assertIn(detail.status_code, (status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED))
        self.assertEqual(self.client.get("/api/orders/").status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_telegram_sent_only_after_commit(self):
        from unittest import mock

        product = make_product()
        with mock.patch("orders.serializers.notify_order_async") as notify:
            with self.captureOnCommitCallbacks(execute=False) as callbacks:
                response = self.client.post(
                    reverse("order-list"),
                    self._payload([{"product": product.id, "quantity": 1}]),
                    format="json",
                )
            notify.assert_not_called()  # hali commit bo'lmagan
            for callback in callbacks:
                callback()
            notify.assert_called_once_with(response.data["id"])
