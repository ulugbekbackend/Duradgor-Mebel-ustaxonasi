"""Katalog API: kategoriya daraxti, mahsulot ro'yxati (filtr/qidiruv/saralash), detal.

Qidiruv: ?q=... (SearchFilter, SEARCH_PARAM settings'da belgilangan).
PostgreSQL full-text search kerak bo'lsa, SearchFilter o'rniga quyidagini qo'shing:

    from django.contrib.postgres.search import SearchVector
    qs = qs.annotate(search=SearchVector("name", "description")).filter(search=q)
"""
from decimal import Decimal, InvalidOperation

from django.db.models import Count
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import serializers, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny

from .models import MATERIAL_CHOICES, STATUS_CHOICES, Category, Product
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Kategoriyalar ro'yxati (ota-bola tuzilma bilan)."""

    queryset = (
        Category.objects.select_related("parent")
        .prefetch_related("children")
        .annotate(products_count=Count("products"))
    )
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None  # kategoriyalar kam — hammasi birdan
    lookup_field = "slug"


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Mahsulotlar: filtr, qidiruv, saralash, sahifalash.

    Filtrlar:
      ?category=sofas        — kategoriya (bolalari bilan birga)
      ?q=divan               — nomi/tavsifi bo'yicha qidiruv (icontains/SearchFilter)
      ?material=oak,walnut   — material bo'yicha
      ?price_min=1000000&price_max=9000000
      ?status=in_stock | on_order
    Saralash: ?ordering=price | -price | -created_at | -popularity
    """

    permission_classes = [AllowAny]
    lookup_field = "slug"
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description", "category__name"]
    ordering_fields = ["price", "created_at", "popularity"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter("category", str, description="Kategoriya slug'i"),
            OpenApiParameter("material", str, description="Material kalitlari (vergul bilan)"),
            OpenApiParameter("price_min", Decimal, description="Minimal narx"),
            OpenApiParameter("price_max", Decimal, description="Maksimal narx"),
            OpenApiParameter("status", str, description="in_stock yoki on_order"),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        qs = Product.objects.select_related("category").prefetch_related("images", "variants")
        params = self.request.query_params

        category_slug = params.get("category")
        if category_slug:
            category = Category.objects.filter(slug=category_slug).first()
            if category is None:
                return qs.none()  # noma'lum kategoriya — bo'sh ro'yxat (404 emas)
            qs = qs.filter(category__slug__in=category.get_descendant_slugs())

        materials = params.get("material")
        if materials:
            wanted = {m.strip() for m in materials.split(",") if m.strip()}
            unknown = wanted - {key for key, _ in MATERIAL_CHOICES}
            if unknown:
                raise serializers.ValidationError({"material": f"Noma'lum material: {', '.join(sorted(unknown))}"})
            qs = qs.filter(material__in=wanted)

        for key, lookup in (("price_min", "price__gte"), ("price_max", "price__lte")):
            value = params.get(key)
            if value:
                try:
                    qs = qs.filter(**{lookup: Decimal(value)})
                except InvalidOperation:
                    raise serializers.ValidationError({key: "Raqam bo'lishi kerak."}) from None

        status = params.get("status")
        if status:
            if status not in {key for key, _ in STATUS_CHOICES}:
                raise serializers.ValidationError({"status": "in_stock yoki on_order bo'lishi kerak."})
            qs = qs.filter(status=status)

        return qs
