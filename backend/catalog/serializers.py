from rest_framework import serializers

from .models import Category, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    children = serializers.SlugRelatedField(slug_field="slug", many=True, read_only=True)
    products_count = serializers.IntegerField(read_only=True)  # view annotate() qiladi

    class Meta:
        model = Category
        fields = ["id", "name", "name_ru", "slug", "parent", "children", "image", "products_count"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt", "sort_order"]


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "name", "name_ru", "color_code", "price_delta"]


class ProductListSerializer(serializers.ModelSerializer):
    """Ro'yxat uchun serializer (kartochka: rang nuqtalari uchun variantlar ham)."""

    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "slug", "name", "name_ru", "category", "price", "old_price", "cover",
            "material", "material_label", "material_label_ru", "variants",
            "stock", "status", "is_featured", "is_new", "popularity", "created_at",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detal sahifa uchun to'liq serializer."""

    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    dimensions = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "slug", "name", "name_ru", "description", "description_ru", "category",
            "price", "old_price", "cover", "images", "variants",
            "material", "material_label", "material_label_ru", "dimensions",
            "stock", "status", "is_featured", "is_new", "popularity",
            "created_at", "updated_at",
        ]

    def get_dimensions(self, obj):
        return {"width": obj.width, "depth": obj.depth, "height": obj.height}
