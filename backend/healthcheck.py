"""Docker HEALTHCHECK: /api/health/ ga so'rov.

Host sarlavhasi ALLOWED_HOSTS dan olinadi (aks holda 400), X-Forwarded-Proto=https esa
SECURE_SSL_REDIRECT yo'naltirishini chetlab o'tadi — so'rov nginx'dan kelgandek ko'rinadi.
"""
import os
import sys
import urllib.request

host = os.environ.get("ALLOWED_HOSTS", "localhost").split(",")[0].strip().lstrip(".")
if not host or host == "*":
    host = "localhost"

request = urllib.request.Request(
    "http://127.0.0.1:8000/api/health/",
    headers={"Host": host, "X-Forwarded-Proto": "https"},
)
try:
    urllib.request.urlopen(request, timeout=4)
except Exception as exc:  # noqa: BLE001
    print(exc, file=sys.stderr)
    sys.exit(1)
