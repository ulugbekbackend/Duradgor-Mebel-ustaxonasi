from django.db import connection
from django.http import JsonResponse


def health(request):
    """Docker healthcheck: ilova va baza javob beradimi."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return JsonResponse({"status": "ok"})
