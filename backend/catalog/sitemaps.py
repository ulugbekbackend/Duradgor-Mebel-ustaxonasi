"""sitemap.xml — bazadagi hozirgi kategoriya va mahsulotlardan avtomatik (Django sitemaps).

Manzillar frontend (React) sahifalariga ishora qiladi; domen va protokol so'rovdan olinadi
(nginx ortida production'da Host = domen, X-Forwarded-Proto = https).
"""
from django.contrib.sitemaps import Sitemap

from .models import Category, Product


class StaticPagesSitemap(Sitemap):
    changefreq = "weekly"

    def items(self):
        return ["/", "/katalog", "/aloqa"]

    def location(self, item):
        return item

    def priority(self, item):
        return {"/": 1.0, "/katalog": 0.9}.get(item, 0.6)


class CategorySitemap(Sitemap):
    changefreq = "daily"
    priority = 0.8

    def items(self):
        return Category.objects.order_by("id")

    def location(self, obj):
        return f"/katalog/{obj.slug}"


class ProductSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return Product.objects.order_by("id")

    def location(self, obj):
        return f"/mahsulot/{obj.slug}"

    def lastmod(self, obj):
        return obj.updated_at


SITEMAPS = {"pages": StaticPagesSitemap, "categories": CategorySitemap, "products": ProductSitemap}
