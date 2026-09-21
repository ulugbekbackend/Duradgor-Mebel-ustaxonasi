FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    GUNICORN_WORKERS=3

WORKDIR /app

# psycopg[binary] o'z libpq'si bilan keladi — kompilyator kerak emas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# root bo'lmagan foydalanuvchi; volume'lar shu egalik bilan yaratiladi
RUN useradd --create-home --uid 1000 app \
    && mkdir -p /app/staticfiles /app/media \
    && chown -R app:app /app
USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python healthcheck.py

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS}"]
