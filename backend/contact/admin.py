from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "phone", "short_message", "is_processed", "created_at"]
    list_filter = ["is_processed", "created_at"]
    list_editable = ["is_processed"]
    search_fields = ["name", "phone", "message"]
    readonly_fields = ["name", "phone", "message", "created_at"]
    date_hierarchy = "created_at"

    @admin.display(description="Xabar")
    def short_message(self, obj):
        return (obj.message[:60] + "…") if len(obj.message) > 60 else obj.message

    def has_add_permission(self, request):
        return False  # murojaatlar faqat saytdan keladi
