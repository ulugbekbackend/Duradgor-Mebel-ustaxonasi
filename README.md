# 🪑 Duradgor Mebel — mebel katalogi va buyurtma platformasi

Mebel ustasi uchun onlayn katalog + savat + buyurtma tizimi.

**Texnologiyalar:** Django 5.2 + DRF • React 19 (Vite) • PostgreSQL • Docker • python-decouple • drf-spectacular • Pillow (WebP)

## 📁 Loyiha tuzilishi (apps/ papkasisiz)

```
├── backend/
│   ├── manage.py
│   ├── config/          # settings, urls, wsgi/asgi
│   ├── catalog/         # Category, Product, ProductImage, ProductVariant + `seed_demo` buyrug'i
│   ├── orders/          # Order, OrderItem, Customer + Telegram bildirishnoma
│   ├── core/            # mixins (media tozalash), utils (Telegram, WebP), pagination, /api/health/
│   ├── requirements.txt # pin qilingan versiyalar
│   └── Dockerfile
├── frontend/            # React 19 frontend (Vite + Tailwind, uz/ru)
│   ├── src/  public/  index.html  package.json
│   ├── nginx.conf       # SPA fallback (BrowserRouter)
│   └── Dockerfile
├── deploy/
│   ├── nginx.conf       # HTTP (lokal/test)
│   └── nginx.https.conf # production HTTPS shabloni
├── scripts/backup_db.sh
└── docker-compose.yml   # barcha sozlamalar backend/.env dan
```

## 🚀 1) Docker bilan ishga tushirish (eng oson)

```bash
cp backend/.env.example backend/.env   # DB_NAME/DB_USER/DB_PASSWORD, SECRET_KEY va boshqalarni to'ldiring
docker compose up --build -d
docker compose exec backend python manage.py seed_demo   # ixtiyoriy: demo katalog
```

PostgreSQL konteyneri ham `backend/.env` dagi `DB_NAME`, `DB_USER`, `DB_PASSWORD` bilan yaratiladi —
qiymatlar bir marta yoziladi (bittasi bo'sh bo'lsa `db` aniq xabar bilan to'xtaydi). `DB_ENGINE`, `DB_HOST`, `DB_PORT`
docker'da avtomatik PostgreSQL / `db` / `5432` bo'ladi.

> ⚠️ `DB_*` qiymatlari DB **birinchi marta** yaratilganda qo'llanadi. Keyin parolni o'zgartirsangiz,
> PostgreSQL ichida ham o'zgartiring (yoki `docker compose down -v` bilan bazani o'chirib qayta yarating — ma'lumot yo'qoladi).

Natijalar:
- Sayt: http://localhost
- Admin panel: http://localhost/admin (superuser yarating: `docker compose exec backend python manage.py createsuperuser`)
- Swagger: http://localhost/api/docs/
- Media tozalash va boshqa testlar: `docker compose exec backend pytest`

## 🛠 2) Qo'lda ishga tushirish

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env     # DB_PASSWORD ni yozing yoki SQLite uchun DB_ENGINE/DB_NAME ni almashtiring (izohda bor)
python manage.py migrate
python manage.py seed_demo        # demo kategoriya/mahsulotlar (frontend katalogi bilan bir xil)
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

**Frontend** (alohida terminal):
```bash
cd frontend
npm install
npm run dev              # http://localhost:3000
```

**Frontendni real API'ga ulash uchun** `frontend/.env` (`frontend/.env.example` dan nusxa):
```
VITE_API_URL=http://localhost:8000/api
```
Qiymat `/api` bilan birga yoziladi (docker'da `/api`). Bu ko'rsatkich bo'lmasa frontend
demo-rejimda (lokaldagi katalog ma'lumotlari bilan) ishlaydi — backend'siz ham ko'rsatish mumkin.

> Frontend matn, rasm va tarjimalarni `frontend/src/data/catalog.js` dan oladi; API'dan
> narx, stok va holat keladi. Shuning uchun demo katalog `seed_demo` bilan yuklanadi —
> id'lar (mahsulot va rang variantlari) ikkala tomonda bir xil.

## 🔌 API

| Metod | Yo'l | Vazifasi |
|---|---|---|
| GET | `/api/catalog/categories/` | Kategoriyalar (ota-bola, mahsulotlar soni bilan) |
| GET | `/api/catalog/products/` | Mahsulotlar: `category`, `q`, `material`, `price_min`, `price_max`, `status`, `ordering`, `page`, `page_size` |
| GET | `/api/catalog/products/{slug}/` | Mahsulot tafsiloti (rasmlar, rang variantlari) |
| POST | `/api/orders/` | Buyurtma yaratish (`full_name`, `phone`, `address`, `comment`, `payment_method`, `items: [{product, variant, quantity}]`) |
| GET | `/api/health/` | Healthcheck |

Buyurtmalarni o'qish ochiq API'da yo'q — ular faqat admin panelda. To'liq sxema: `/api/docs/` (Swagger).

## 🧪 3) Testlar

```bash
cd backend
# .env da test uchun SQLite ham mumkin: DB_ENGINE=django.db.backends.sqlite3, DB_NAME=:memory:
pytest
```

Qamrab olingan:
- `core/tests.py` — **media tozalash signallari**: `post_delete` (obyekt o'chsa fayl ham o'chadi) va `pre_save` (yangi rasm yuklansa eski fayl diskdan yo'qoladi);
- `orders/tests.py` — buyurtma yaratish, jami summa, stok kamayishi (bir mahsulot bir necha qatorda ham), rang varianti narxi, telefon normallashtirish, qayta mijoz, buyurtmalar ochiq API'da o'qilmasligi, Telegram faqat commit'dan keyin;
- `catalog/tests.py` — qidiruv, kategoriya (ota-bola) filtri, narx oralig'i, saralash, noto'g'ri filtrlar (400), `seed_demo`.

## 🗑 Media fayllarni avtomatik tozalash (muhim mexanizm)

`core/mixins.py` dagi `connect_media_cleanup_signals(Model, field_names)` funksiyasi
bitta joyda yozilgan va barcha media-modellarga ulanganda ikki signal qo'shadi:

1. **post_delete** — obyekt o'chirilganda `field.storage.delete(file.name)` diskdan faylni o'chiradi;
2. **pre_save** — bazadagi eski fayl yo'li olinadi, yangi fayldan farq qilsa eski fayl o'chiriladi.

Ulanish joyi — `catalog/apps.py` → `ready()`: `Product.cover` va `ProductImage.image`.
Har bir modelda qayta yozilmaydi.

## 📲 Telegram bot sozlash

1. `@BotFather` → `/newbot` → token oling → `backend/.env`: `TELEGRAM_BOT_TOKEN=...`
2. Botga yozing, so'ng `https://api.telegram.org/bot<TOKEN>/getUpdates` dan `chat.id` ni oling → `TELEGRAM_CHAT_ID=...`
3. Yangi buyurtma kelganda ustaga mahsulotlar (rangi bilan), mijoz va jami summa bilan xabar boradi.
   Xabar tranzaksiya yakunlangach fon oqimida yuboriladi — Telegram sekin bo'lsa ham mijoz kutmaydi.

## 💳 To'lovlar (Payme/Click) arxitekturasi

Hozir buyurtma **to'lovsiz** qabul qilinadi (`payment_status=pending`).
`Order` modelida `payment_method` va `payment_status` maydonlari tayyor —
Payme/Click SDK qo'shilganda faqat to'lovni tasdiqlovchi view va webhook yoziladi,
model o'zgarmaydi.

## 🌐 Production

> Domen hali olinmagan — hamma joyda `example.com` andoza. Domen olingach uni quyidagilarda almashtiring:
> `frontend/public/sitemap.xml`, `frontend/public/robots.txt`, `deploy/nginx.https.conf`,
> `backend/.env` (`ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`) va `docker-compose.yml` dagi Traefik izohi.

- `backend/.env`: `DEBUG=False`, `ALLOWED_HOSTS=example.com`, `SECURE_SSL_REDIRECT=True`, maxfiy `SECRET_KEY` (bo'lmasa ilova ishga tushmaydi).
- HTTPS: `deploy/nginx.https.conf` (certbot sertifikatlari bilan) — `docker-compose.yml` dagi nginx volume'ini shu faylga almashtiring, `443` portini oching va sertifikat papkalarini ulang (`/etc/letsencrypt`, `/var/www/certbot`). HTTPS'siz `SECURE_SSL_REDIRECT=False` qoldiring.
- CORS faqat kerakli domenlarga ochiq (`CORS_ALLOWED_ORIGINS`).
- DRF throttling: buyurtma uchun `10/soat` (`orders` scope), mehmonlar uchun `1000/soat`. Nginx ortida `NUM_PROXIES=1` (compose beradi).
- Backend konteyneri root'siz ishlaydi, `HEALTHCHECK` → `/api/health/`; nginx backend sog'lom bo'lgach ishga tushadi.
- `deploy/nginx.conf` statik/media fayllarni volume'lardan tarqatadi; Traefik label'lari `docker-compose.yml` da izohda tayyor.
- Backup: `./scripts/backup_db.sh` (14 kun saqlanadi, cron'ga qo'shing).

## 🗺 SEO

Frontendda sahifa darajasidagi title/description/OG teglari (uz/ru), toza URL'lar
(`BrowserRouter`, `#` siz), `public/robots.txt` va `public/sitemap.xml` tayyor — domenni o'zgartirib production'ga qo'ying.

## ⚠️ Ma'lum cheklovlar

- **Andoza ma'lumotlar:** telefon (`+998 XX XXX XX XX`), Telegram, Facebook, Instagram havolalari va domen
  (`example.com`). Kontaktlar bitta joyda — `frontend/src/components/layout.jsx` konstantalari.
- **Rasmlar:** mahsulot rasmlari va `og:image` tashqi vaqtinchalik havolalarda (`frontend/src/data/images.js`).
  Production'dan oldin haqiqiy suratlarni `public/` yoki media'ga joylang.
- **Aloqa formasi** hozircha hech qayerga yubormaydi — faqat "yuborildi" xabarini ko'rsatadi.
- **Admin'da qo'shilgan yangi mahsulotlar** katalog ro'yxatida chiqadi, lekin mahsulot sahifasi va savat
  hozircha faqat `frontend/src/data/catalog.js` dagi mahsulotlar bilan ishlaydi.
