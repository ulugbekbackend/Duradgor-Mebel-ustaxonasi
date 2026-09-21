"""Katalog modellari: Category (ota-bola), Product, ProductImage, ProductVariant."""
from django.db import models
from django.urls import reverse

from core.utils import WebPMixin

MATERIAL_CHOICES = [
    ("beech", "Buk yog'ochi"),
    ("oak", "Eman yog'ochi"),
    ("walnut", "Yong'oq yog'ochi"),
    ("mdf", "MDF / LDSP"),
    ("linen", "Zig'ir mato"),
    ("velour", "Velur"),
    ("boucle", "Bukle mato"),
    ("rattan", "Ratan"),
]

STATUS_CHOICES = [
    ("in_stock", "Mavjud"),
    ("on_order", "Buyurtmaga"),
]


class Category(WebPMixin, models.Model):
    """Ota-bola (parent-child) tuzilishidagi kategoriya: Mehmonxona -> Divanlar."""

    webp_fields = ("image",)

    name = models.CharField("Nomi", max_length=120)
    name_ru = models.CharField("Nomi (ru)", max_length=120, blank=True)
    slug = models.SlugField("Slug", max_length=140, unique=True)
    parent = models.ForeignKey(
        "self",
        verbose_name="Ota kategoriya",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="children",
    )
    image = models.ImageField("Rasm", upload_to="categories/", blank=True, null=True)

    class Meta:
        verbose_name = "Kategoriya"
        verbose_name_plural = "Kategoriyalar"
        ordering = ["parent_id", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.convert_images_to_webp()
        super().save(*args, **kwargs)

    def get_descendant_slugs(self) -> list[str]:
        """O'zi + barcha avlodlarining slug'lari (filtrlash uchun).

        Kategoriyalar kam — bitta so'rov bilan hammasi olinib, daraxt xotirada aylaniladi.
        """
        children_of: dict[int | None, list[tuple[int, str]]] = {}
        for pk, parent_id, slug in Category.objects.values_list("pk", "parent_id", "slug"):
            children_of.setdefault(parent_id, []).append((pk, slug))

        slugs, stack = [self.slug], [self.pk]
        while stack:
            for pk, slug in children_of.get(stack.pop(), []):
                slugs.append(slug)
                stack.append(pk)
        return slugs


class Product(WebPMixin, models.Model):
    webp_fields = ("cover",)

    category = models.ForeignKey(
        Category, verbose_name="Kategoriya", on_delete=models.PROTECT, related_name="products"
    )
    name = models.CharField("Nomi", max_length=200)
    name_ru = models.CharField("Nomi (ru)", max_length=200, blank=True)
    slug = models.SlugField("Slug", max_length=220, unique=True)
    description = models.TextField("Tavsif")
    description_ru = models.TextField("Tavsif (ru)", blank=True)
    price = models.DecimalField("Narx", max_digits=12, decimal_places=2)
    old_price = models.DecimalField("Eski narx", max_digits=12, decimal_places=2, null=True, blank=True)
    cover = models.ImageField("Asosiy rasm", upload_to="products/covers/", blank=True, null=True)
    material = models.CharField("Material", max_length=30, choices=MATERIAL_CHOICES)
    material_label = models.CharField(
        "Material izohi", max_length=200, blank=True, help_text="Masalan: Buk yog'ochi, zig'ir mato"
    )
    material_label_ru = models.CharField("Material izohi (ru)", max_length=200, blank=True)
    width = models.PositiveSmallIntegerField("Eni (sm)")
    depth = models.PositiveSmallIntegerField("Chuqurligi (sm)")
    height = models.PositiveSmallIntegerField("Balandligi (sm)")
    stock = models.PositiveIntegerField("Stok", default=0)
    status = models.CharField("Holat", max_length=10, choices=STATUS_CHOICES, default="in_stock")
    popularity = models.PositiveIntegerField("Ommaboplik", default=0)
    is_featured = models.BooleanField("Tavsiya etilgan", default=False)
    is_new = models.BooleanField("Yangi", default=False)
    created_at = models.DateTimeField("Yaratilgan", auto_now_add=True)
    updated_at = models.DateTimeField("Yangilangan", auto_now=True)

    class Meta:
        verbose_name = "Mahsulot"
        verbose_name_plural = "Mahsulotlar"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["category", "status"])]

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("product-detail", kwargs={"pk": self.pk})

    def save(self, *args, **kwargs):
        self.convert_images_to_webp()  # WebP'ga avtomatik o'girish (core.utils)
        super().save(*args, **kwargs)


class ProductImage(WebPMixin, models.Model):
    """Mahsulotning qo'shimcha rasmlari (galereya)."""

    webp_fields = ("image",)

    product = models.ForeignKey(
        Product, verbose_name="Mahsulot", on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField("Rasm", upload_to="products/gallery/")
    alt = models.CharField("Alt matn", max_length=200, blank=True)
    sort_order = models.PositiveSmallIntegerField("Tartib raqami", default=0)

    class Meta:
        verbose_name = "Mahsulot rasmi"
        verbose_name_plural = "Mahsulot rasmlari"
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.product.name} — rasm #{self.sort_order}"

    def save(self, *args, **kwargs):
        self.convert_images_to_webp()
        super().save(*args, **kwargs)


class ProductVariant(models.Model):
    """Rang / variant: nomi, rang kodi, narx farqi."""

    product = models.ForeignKey(
        Product, verbose_name="Mahsulot", on_delete=models.CASCADE, related_name="variants"
    )
    name = models.CharField("Nomi", max_length=80)
    name_ru = models.CharField("Nomi (ru)", max_length=80, blank=True)
    color_code = models.CharField("Rang kodi (HEX)", max_length=7, default="#000000")
    price_delta = models.DecimalField("Narx farqi", max_digits=12, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Variant"
        verbose_name_plural = "Variantlar"
        ordering = ["id"]

    def __str__(self):
        return f"{self.product.name} — {self.name}"
