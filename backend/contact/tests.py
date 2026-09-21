"""Aloqa formasi API testlari."""
from unittest import mock

from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from core.utils import send_telegram_contact_notification, send_telegram_order_notification

from .models import ContactMessage


class ContactApiTests(APITestCase):
    def setUp(self):
        cache.clear()

    def test_message_saved_with_normalized_phone(self):
        response = self.client.post(
            reverse("contact-create"),
            {"name": "Dilnoza", "phone": "+998 (91) 222-33-44", "message": "Oshxona o'lchovi kerak"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        msg = ContactMessage.objects.get()
        self.assertEqual(msg.phone, "+998912223344")
        self.assertFalse(msg.is_processed)

    def test_invalid_input_rejected(self):
        for payload in ({"name": "A", "phone": "+998901234567"}, {"name": "Ali", "phone": "abc"}):
            response = self.client.post(reverse("contact-create"), payload, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, payload)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_messages_cannot_be_read_via_public_api(self):
        self.assertEqual(self.client.get(reverse("contact-create")).status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_telegram_sent_only_after_commit(self):
        with mock.patch("contact.views.notify_contact_async") as notify:
            with self.captureOnCommitCallbacks(execute=False) as callbacks:
                response = self.client.post(
                    reverse("contact-create"), {"name": "Ali", "phone": "+998901112233"}, format="json"
                )
            notify.assert_not_called()
            for callback in callbacks:
                callback()
            notify.assert_called_once_with(response.data["id"])

    def test_throttled_after_limit(self):
        url = reverse("contact-create")
        codes = [
            self.client.post(url, {"name": "Ali", "phone": "+998901112233"}, format="json").status_code
            for _ in range(6)
        ]
        self.assertEqual(codes[-1], status.HTTP_429_TOO_MANY_REQUESTS)


class TelegramHtmlEscapeTests(APITestCase):
    """Foydalanuvchi matni Telegram HTML'ini buzmasligi kerak."""

    @mock.patch("core.utils.send_telegram_message", return_value=True)
    def test_contact_text_is_escaped(self, send):
        msg = ContactMessage(name="<b>Ali</b>", phone="+998901112233", message="1 < 2 & <a href=x>")
        send_telegram_contact_notification(msg)
        text = send.call_args[0][0]
        self.assertIn("&lt;b&gt;Ali&lt;/b&gt;", text)
        self.assertIn("1 &lt; 2 &amp; &lt;a href=x&gt;", text)

    @mock.patch("core.utils.send_telegram_message", return_value=True)
    def test_order_comment_is_escaped(self, send):
        order = mock.Mock(
            number="DG-1", address="<i>uy</i>", comment="<script>", total=0,
            customer=mock.Mock(full_name="A&B", phone="+998"),
        )
        order.items.all.return_value = []
        order.get_payment_method_display.return_value = "Naqd"
        order.get_payment_status_display.return_value = "Kutilmoqda"
        send_telegram_order_notification(order)
        text = send.call_args[0][0]
        self.assertIn("A&amp;B", text)
        self.assertIn("&lt;i&gt;uy&lt;/i&gt;", text)
        self.assertIn("&lt;script&gt;", text)
        self.assertNotIn("<script>", text)
