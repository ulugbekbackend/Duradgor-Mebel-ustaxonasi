from rest_framework import serializers

from core.validators import validate_phone

from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "phone", "message", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"message": {"max_length": 2000}}

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Ismingizni kiriting.")
        return value

    def validate_phone(self, value):
        return validate_phone(value)
