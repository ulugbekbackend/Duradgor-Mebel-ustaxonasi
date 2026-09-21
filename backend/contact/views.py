from django.db import transaction
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle

from core.utils import notify_contact_async

from .serializers import ContactMessageSerializer


class ContactThrottle(AnonRateThrottle):
    """Spam'ga qarshi: settings'dagi 'contact' scope."""

    scope = "contact"


class ContactMessageCreateView(generics.CreateAPIView):
    """Aloqa formasi: POST /api/contact/ — murojaat admin panelga tushadi va Telegram'ga yuboriladi.

    O'qish (GET) ochiq API'da yo'q — murojaatlar faqat admin panelda.
    """

    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ContactThrottle]

    def perform_create(self, serializer):
        message = serializer.save()
        transaction.on_commit(lambda: notify_contact_async(message.pk))
