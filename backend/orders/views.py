from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .serializers import OrderCreateSerializer


class OrderThrottle(AnonRateThrottle):
    """Buyurtma spam'ini cheklash: settings'dagi 'orders' scope (10/soat)."""

    scope = "orders"


class OrderViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Buyurtma yaratish: POST /api/orders/

    Mijoz ma'lumotlari (ism/telefon/manzil), izoh va pozitsiyalar qabul qilinadi.
    Buyurtma admin panelga tushadi va Telegram botga xabar yuboriladi.
    Buyurtmani o'qish (GET) ochiq API'da yo'q — mijozlar ma'lumoti faqat admin panelda.
    """

    serializer_class = OrderCreateSerializer
    permission_classes = [AllowAny]
    throttle_classes = [OrderThrottle]

    @extend_schema(responses={201: OrderCreateSerializer})
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            {
                "id": order.id,
                "order_number": order.number,
                "total": order.total,
                "payment_status": order.payment_status,
                "message": "Buyurtma qabul qilindi. Usta tez orada bog'lanadi.",
            },
            status=status.HTTP_201_CREATED,
        )
