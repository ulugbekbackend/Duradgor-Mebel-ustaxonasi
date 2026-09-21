from django.contrib import admin
from django.utils.html import format_html

from .models import Customer, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ["product", "product_name", "variant", "variant_name", "price", "quantity", "line_total"]
    readonly_fields = ["line_total"]

    @admin.display(description="Summa")
    def line_total(self, obj):
        return f"{obj.line_total:,.0f} so'm"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "number", "customer", "status_badge", "status", "payment_method",
        "payment_status", "total_display", "items_count", "created_at",
    ]
    list_filter = ["status", "payment_method", "payment_status", "created_at"]
    search_fields = ["number", "customer__full_name", "customer__phone", "address"]
    list_editable = ["status", "payment_status"]
    readonly_fields = ["number", "total", "created_at", "updated_at"]
    inlines = [OrderItemInline]
    date_hierarchy = "created_at"
    actions = ["mark_delivered", "mark_cancelled"]

    @admin.display(description="Holat")
    def status_badge(self, obj):
        colors = {
            Order.Status.NEW: "#d99b26",
            Order.Status.PROCESSING: "#256247",
            Order.Status.DELIVERED: "#3d7f5f",
            Order.Status.CANCELLED: "#a44a2a",
        }
        color = colors.get(obj.status, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:99px;font-size:12px">{}</span>',
            color,
            obj.get_status_display(),
        )

    @admin.display(description="Jami")
    def total_display(self, obj):
        return f"{obj.total:,.0f} so'm"

    @admin.display(description="Pozitsiyalar")
    def items_count(self, obj):
        return obj.items.count()

    @admin.action(description="✅ Yetkazilgan deb belgilash")
    def mark_delivered(self, request, queryset):
        queryset.update(status=Order.Status.DELIVERED)

    @admin.action(description="❌ Bekor qilish")
    def mark_cancelled(self, request, queryset):
        queryset.update(status=Order.Status.CANCELLED)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["full_name", "phone", "address", "orders_count", "created_at"]
    search_fields = ["full_name", "phone"]

    @admin.display(description="Buyurtmalar")
    def orders_count(self, obj):
        return obj.orders.count()
