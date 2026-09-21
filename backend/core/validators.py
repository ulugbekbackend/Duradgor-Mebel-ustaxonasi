"""Umumiy validatorlar."""
import re

from rest_framework import serializers

# Faqat raqam, bo'shliq, "-", "()" va boshida "+"; raqamlar soni 9–15 (E.164 chegarasi)
PHONE_RE = re.compile(r"^\+?[\d\s\-()]+$")


def normalize_phone(value: str) -> str:
    """'+998 (90) 123-45-67' → '+998901234567' — bitta mijoz bitta yozuvda saqlanadi."""
    digits = re.sub(r"\D", "", value)
    return f"+{digits}" if value.strip().startswith("+") else digits


def validate_phone(value: str) -> str:
    """Telefonni tekshiradi va normallashtirilgan ko'rinishda qaytaradi."""
    value = value.strip()
    if not PHONE_RE.match(value) or not 9 <= len(re.sub(r"\D", "", value)) <= 15:
        raise serializers.ValidationError("Telefon raqamini to'g'ri kiriting.")
    return normalize_phone(value)
