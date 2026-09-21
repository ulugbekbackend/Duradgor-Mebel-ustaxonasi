from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from catalog.models import Product, ProductVariant
from core.utils import notify_order_async
from core.validators import validate_phone

from .models import Customer, Order, OrderItem


class OrderItemInputSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(), required=False, allow_null=True
    )
    quantity = serializers.IntegerField(min_value=1, max_value=50)

    def validate(self, attrs):
        variant = attrs.get("variant")
        if variant is not None and variant.product_id != attrs["product"].pk:
            raise serializers.ValidationError({"variant": "Variant bu mahsulotga tegishli emas."})
        return attrs


class OrderCreateSerializer(serializers.ModelSerializer):
    """Buyurtma yaratish: mijoz ma'lumotlari + pozitsiyalar (atomik)."""

    full_name = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField(max_length=255)
    items = OrderItemInputSerializer(many=True, allow_empty=False)

    class Meta:
        model = Order
        fields = [
            "id", "number", "full_name", "phone", "address", "comment",
            "payment_method", "items", "total", "payment_status", "created_at",
        ]
        read_only_fields = ["id", "number", "total", "payment_status", "created_at"]

    def validate_phone(self, value):
        return validate_phone(value)

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")

        # Mahsulot qatorlarini qulflaymiz: parallel buyurtmalar bir xil stokni ikki marta sotmaydi
        product_ids = {item["product"].pk for item in items_data}
        products = Product.objects.select_for_update().in_bulk(product_ids)

        # Bir mahsulot bir necha qatorda (turli rang) kelishi mumkin — jami soni tekshiriladi
        wanted: dict[int, int] = {}
        for item in items_data:
            wanted[item["product"].pk] = wanted.get(item["product"].pk, 0) + item["quantity"]
        for pk, quantity in wanted.items():
            product = products[pk]
            if product.status == "in_stock" and product.stock < quantity:
                raise serializers.ValidationError(
                    {"items": f"'{product.name}' omborda {product.stock} dona qolgan."}
                )

        customer, _ = Customer.objects.update_or_create(
            phone=validated_data["phone"],
            defaults={"full_name": validated_data["full_name"], "address": validated_data["address"]},
        )

        order = Order.objects.create(
            customer=customer,
            address=validated_data["address"],
            comment=validated_data.get("comment", ""),
            payment_method=validated_data.get("payment_method", Order.PaymentMethod.CASH),
        )

        for item in items_data:
            product = products[item["product"].pk]
            variant = item.get("variant")
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                variant=variant,
                variant_name=variant.name if variant else "",
                price=product.price + (variant.price_delta if variant else 0),
                quantity=item["quantity"],
            )

        for pk, quantity in wanted.items():
            if products[pk].status == "in_stock":
                Product.objects.filter(pk=pk).update(stock=F("stock") - quantity)

        order.recalculate_total()

        # Telegram faqat tranzaksiya muvaffaqiyatli yakunlangach, fon oqimida yuboriladi
        transaction.on_commit(lambda: notify_order_async(order.pk))

        return order
