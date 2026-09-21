"""Umumiy yordamchi funksiyalar: Telegram bildirishnoma, WebP konvertatsiya."""
import logging
import threading
from html import escape
from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from django.db import connection

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------ #
# Telegram bot — ustaga xabarlar (buyurtma, aloqa formasi)            #
# ------------------------------------------------------------------ #
def send_telegram_message(text: str) -> bool:
    """Ustaning Telegram chatiga HTML xabar yuboradi.

    Matndagi foydalanuvchi ma'lumotlari chaqiruvchi tomonidan escape() qilinishi shart.
    Xato bo'lsa faqat logga yoziladi (asosiy amal baribir saqlanadi).
    """
    import requests  # import ichkarida: testlarda majburiy bo'lmasligi uchun

    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID
    if not token or not chat_id:
        logger.warning("Telegram sozlanmagan (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)")
        return False

    try:
        response = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
            timeout=5,
        )
        response.raise_for_status()
        return True
    except requests.RequestException as exc:  # noqa: BLE001
        logger.warning("Telegram xabar yuborilmadi: %s", exc)
        return False


def send_telegram_order_notification(order) -> bool:
    """Yangi buyurtma haqida ustaga Telegram xabar."""
    items_text = "\n".join(
        f"  ▪ {escape(item.product_name)}{f' ({escape(item.variant_name)})' if item.variant_name else ''}"
        f" × {item.quantity} — {item.line_total:,.0f} so'm"
        for item in order.items.all()
    )
    text = (
        f"🪑 <b>Yangi buyurtma — {escape(order.number)}</b>\n\n"
        f"👤 {escape(order.customer.full_name)}\n"
        f"📞 {escape(order.customer.phone)}\n"
        f"📍 {escape(order.address)}\n\n"
        f"<b>Mahsulotlar:</b>\n{items_text}\n\n"
        f"💰 Jami: <b>{order.total:,.0f} so'm</b>\n"
        f"💳 To'lov: {order.get_payment_method_display()} "
        f"({order.get_payment_status_display()})"
    )
    if order.comment:
        text += f"\n💬 Izoh: {escape(order.comment)}"
    return send_telegram_message(text)


def send_telegram_contact_notification(message) -> bool:
    """Aloqa formasidan kelgan xabar haqida ustaga Telegram xabar."""
    text = (
        f"✉️ <b>Saytdan yangi murojaat</b>\n\n"
        f"👤 {escape(message.name)}\n"
        f"📞 {escape(message.phone)}"
    )
    if message.message:
        text += f"\n\n💬 {escape(message.message)}"
    return send_telegram_message(text)


def _run_in_background(job, label: str) -> None:
    """Ishni fon oqimida bajaradi — mijoz javobni Telegram'ni kutmasdan oladi."""

    def _run():
        try:
            job()
        except Exception:  # noqa: BLE001
            logger.exception("%s: Telegram xabari yuborilmadi", label)
        finally:
            connection.close()  # oqimning o'z DB ulanishi

    threading.Thread(target=_run, daemon=True).start()


def notify_order_async(order_id: int) -> None:
    def job():
        from orders.models import Order

        order = Order.objects.select_related("customer").prefetch_related("items").get(pk=order_id)
        send_telegram_order_notification(order)

    _run_in_background(job, f"Buyurtma {order_id}")


def notify_contact_async(message_id: int) -> None:
    def job():
        from contact.models import ContactMessage

        send_telegram_contact_notification(ContactMessage.objects.get(pk=message_id))

    _run_in_background(job, f"Murojaat {message_id}")


# ------------------------------------------------------------------ #
# Rasm optimallashtirish — Pillow orqali WebP'ga avtomatik o'girish    #
# ------------------------------------------------------------------ #
class WebPMixin:
    """ImageField'larni saqlashda avtomatik WebP formatga o'giradi.

    Model save() boshida `self.convert_images_to_webp()` chaqiriladi:

        class ProductImage(WebPMixin, models.Model):
            webp_fields = ("image",)
            image = models.ImageField(upload_to="products/")

            def save(self, *args, **kwargs):
                self.convert_images_to_webp()
                super().save(*args, **kwargs)
    """

    webp_fields: tuple = ("image",)

    def convert_images_to_webp(self):
        from PIL import Image

        if not getattr(settings, "CONVERT_MEDIA_TO_WEBP", False):
            return
        for field_name in self.webp_fields:
            field_file = getattr(self, field_name)
            if not field_file or not field_file.name or field_file.name.lower().endswith(".webp"):
                continue
            try:
                field_file.open("rb")
                with Image.open(field_file) as img:
                    img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
                    buffer = BytesIO()
                    img.save(buffer, format="WEBP", quality=settings.WEBP_QUALITY)
                webp_name = field_file.name.rsplit(".", 1)[0] + ".webp"
                new_file = ContentFile(buffer.getvalue())
                field_file.save(webp_name, new_file, save=False)
            except Exception as exc:  # noqa: BLE001
                logger.warning("WebP konvertatsiya muvaffaqiyatsiz (%s): %s", field_name, exc)
