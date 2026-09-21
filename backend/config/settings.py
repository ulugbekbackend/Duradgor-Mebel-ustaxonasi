"""
Duradgor Mebel — Django 5.2 settings.
Sozlamalar python-decouple orqali .env fayldan o'qiladi.
Loyiha tuzilishi: apps/ papkasi YO'Q — catalog/, orders/, core/ config/ bilan bir qatorda.
"""
from pathlib import Path

from decouple import Csv, config
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = config("DEBUG", default=False, cast=bool)
SECRET_KEY = config("SECRET_KEY", default="")
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured("SECRET_KEY .env da berilishi shart (DEBUG=False).")
    SECRET_KEY = "django-insecure-faqat-lokal-dev"
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Tashqi
    "rest_framework",
    "drf_spectacular",
    "corsheaders",
    # Loyiha ilovalari (tub papkada, apps/ siz)
    "core",
    "catalog",
    "orders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ------------------------------------------------------------------ #
# Ma'lumotlar bazasi — PostgreSQL (.env orqali)                        #
# ------------------------------------------------------------------ #
DATABASES = {
    "default": {
        "ENGINE": config("DB_ENGINE", default="django.db.backends.postgresql"),
        "NAME": config("DB_NAME", default="duradgor"),
        "USER": config("DB_USER", default="duradgor"),
        "PASSWORD": config("DB_PASSWORD", default=""),
        "HOST": config("DB_HOST", default="127.0.0.1"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ------------------------------------------------------------------ #
# Ko'p tillilik (uz / ru)                                              #
# ------------------------------------------------------------------ #
LANGUAGE_CODE = "uz"
LANGUAGES = [("uz", "O'zbekcha"), ("ru", "Русский")]
TIME_ZONE = "Asia/Tashkent"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ------------------------------------------------------------------ #
# Django REST Framework                                                #
# ------------------------------------------------------------------ #
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 9,
    "DEFAULT_FILTER_BACKENDS": [
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "SEARCH_PARAM": "q",
    # Nginx ortida: X-Forwarded-For'dagi nechta proksi ishonchli (docker'da 1).
    # 0 — to'g'ridan-to'g'ri ulanish (REMOTE_ADDR); sarlavhani soxtalashtirib bo'lmaydi.
    "NUM_PROXIES": config("NUM_PROXIES", default=0, cast=int),  # ?q=... — mahsulot nomi/tavsifi bo'yicha qidiruv
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "1000/hour",  # SPA bir sahifada bir nechta so'rov yuboradi
        "user": "600/hour",
        "orders": "10/hour",  # buyurtma spam'iga qarshi (OrderThrottle scope)
    },
}

# ------------------------------------------------------------------ #
# drf-spectacular — Swagger / OpenAPI hujjatlari                       #
# ------------------------------------------------------------------ #
SPECTACULAR_SETTINGS = {
    "TITLE": "Duradgor Mebel API",
    "DESCRIPTION": "Mebel ustaxonasi uchun katalog va buyurtma API'si (uz/ru).",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}

# ------------------------------------------------------------------ #
# CORS — faqat kerakli frontend domenlari                              #
# ------------------------------------------------------------------ #
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000,http://127.0.0.1:3000",
    cast=Csv(),
)
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS", default="http://localhost:3000", cast=Csv()
)

# ------------------------------------------------------------------ #
# Telegram bot — yangi buyurtma xabari                                 #
# ------------------------------------------------------------------ #
TELEGRAM_BOT_TOKEN = config("TELEGRAM_BOT_TOKEN", default="")
TELEGRAM_CHAT_ID = config("TELEGRAM_CHAT_ID", default="")

# Rasm yuklashda WebP'ga avtomatik o'girish (Pillow)
CONVERT_MEDIA_TO_WEBP = config("CONVERT_MEDIA_TO_WEBP", default=True, cast=bool)
WEBP_QUALITY = config("WEBP_QUALITY", default=82, cast=int)

# ------------------------------------------------------------------ #
# Production xavfsizlik (DEBUG=False bo'lganda avtomatik yoqiladi)     #
# ------------------------------------------------------------------ #
if not DEBUG:
    SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    X_FRAME_OPTIONS = "DENY"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {
        "core.utils": {"handlers": ["console"], "level": "WARNING"},
    },
}
