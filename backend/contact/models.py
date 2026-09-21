"""Saytdagi aloqa formasidan kelgan murojaatlar."""
from django.db import models


class ContactMessage(models.Model):
    name = models.CharField("Ism", max_length=120)
    phone = models.CharField("Telefon", max_length=20)
    message = models.TextField("Xabar", blank=True)
    is_processed = models.BooleanField("Ko'rib chiqildi", default=False)
    created_at = models.DateTimeField("Yuborilgan", auto_now_add=True)

    class Meta:
        verbose_name = "Murojaat"
        verbose_name_plural = "Murojaatlar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.phone})"
