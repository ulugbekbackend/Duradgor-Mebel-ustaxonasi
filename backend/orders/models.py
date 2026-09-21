"""Buyurtma modellari: Customer, Order, OrderItem.

To'lov arxitekturasi: hozircha to'lovsiz (payment_status=pending),
keyin Payme/Click qo'shiladi — Order.payment_method/payment_status
maydonlari bunga tayyor.
"""
from decimal import Decimal

from django.db import models


class Customer(models.Model):
    full_name = models.CharField("F.I.Sh.", max_length=120)
    phone = models.CharField("Telefon", max_length=20, unique=True)  # normallashtirilgan: +998901234567
    address = models.CharField("Oxirgi manzil", max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Mijoz"
        verbose_name_plural = "Mijozlar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.phone})"


class Order(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Yangi"
        PROCESSING = "processing", "Jarayonda"
        DELIVERED = "delivered", "Yetkazilgan"
        CANCELLED = "cancelled", "Bekor qilingan"

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Naqd"
        ONLINE = "online", "Payme / Click"
        TERMINAL = "terminal", "Terminal"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Kutilmoqda"
        PAID = "paid", "To'langan"
        FAILED = "failed", "Muvaffaqiyatsiz"
        REFUNDED = "refunded", "Qaytarilgan"

    number = models.CharField("Buyurtma raqami", max_length=20, unique=True, blank=True)
    customer = models.ForeignKey(
        Customer, verbose_name="Mijoz", on_delete=models.PROTECT, related_name="orders"
    )
    address = models.CharField("Yetkazish manzili", max_length=255, default="")
    comment = models.TextField("Izoh", blank=True)
    status = models.CharField("Holat", max_length=12, choices=Status.choices, default=Status.NEW)
    payment_method = models.CharField(
        "To'lov usuli", max_length=10, choices=PaymentMethod.choices, default=PaymentMethod.CASH
    )
    payment_status = models.CharField(
        "To'lov holati", max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    total = models.DecimalField("Jami", max_digits=14, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Buyurtma"
        verbose_name_plural = "Buyurtmalar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.number} — {self.customer.full_name}"

    def save(self, *args, **kwargs):
        if not self.number:
            # DG-<id> formatidagi raqam; avval saqlab id olinadi
            super().save(*args, **kwargs)
            self.number = f"DG-{self.pk}"
            kwargs.pop("force_insert", None)
        super().save(*args, **kwargs)

    def recalculate_total(self):
        self.total = sum(
            (item.line_total for item in self.items.all()), Decimal("0")
        )
        self.save(update_fields=["total", "updated_at"])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, verbose_name="Buyurtma", on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "catalog.Product", verbose_name="Mahsulot", null=True, on_delete=models.SET_NULL
    )
    product_name = models.CharField("Mahsulot nomi (snapshot)", max_length=200)
    variant = models.ForeignKey(
        "catalog.ProductVariant", verbose_name="Variant", null=True, blank=True, on_delete=models.SET_NULL
    )
    variant_name = models.CharField("Variant (snapshot)", max_length=80, blank=True)
    price = models.DecimalField("Narx (snapshot, variant farqi bilan)", max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField("Soni", default=1)

    class Meta:
        verbose_name = "Buyurtma pozitsiyasi"
        verbose_name_plural = "Buyurtma pozitsiyalari"

    def __str__(self):
        variant = f" ({self.variant_name})" if self.variant_name else ""
        return f"{self.product_name}{variant} × {self.quantity}"

    @property
    def line_total(self) -> Decimal:
        return self.price * self.quantity
