from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product, ProductImage, ProductVariant


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["image", "preview", "alt", "sort_order"]
    readonly_fields = ["preview"]

    @admin.display(description="Ko'rinish")
    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:60px;border-radius:6px"/>', obj.image.url)
        return "—"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "parent", "products_count"]
    search_fields = ["name", "slug"]
    list_filter = ["parent"]
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Mahsulotlar")
    def products_count(self, obj):
        return obj.products.count()


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "cover_thumb", "name", "category", "price", "stock", "status",
        "is_featured", "is_new", "created_at",
    ]
    list_filter = ["category", "status", "material", "is_featured", "is_new"]
    search_fields = ["name", "slug", "description"]
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ["price", "stock", "status", "is_featured", "is_new"]
    inlines = [ProductImageInline, ProductVariantInline]
    date_hierarchy = "created_at"
    fieldsets = (
        (None, {"fields": ("category", "name", "slug", "description", "cover")}),
        ("Narx va stok", {"fields": ("price", "old_price", "stock", "status", "popularity")}),
        ("Xususiyatlar", {"fields": ("material", "width", "depth", "height")}),
        ("Belgilar", {"fields": ("is_featured", "is_new")}),
    )

    @admin.display(description="Rasm")
    def cover_thumb(self, obj):
        if obj.cover:
            return format_html('<img src="{}" style="max-height:48px;border-radius:6px"/>', obj.cover.url)
        return "—"
