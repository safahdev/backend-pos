# POS API Backend

Backend layanan **Point of Sale (POS)** berbasis **Node.js & Express**, menggunakan **Prisma ORM** untuk manajemen database, **Midtrans** untuk pembayaran, **MinIO** untuk object storage, serta **OTP & JWT** untuk autentikasi. Sistem ini dirancang modular, terstruktur, dan siap dikembangkan.

---

## ✨ Fitur Utama

### 🔐 Autentikasi & Keamanan

* Login, Register, OTP Verification
* JWT-based Authentication & Authorization
* Role-based Access (Admin / Cashier)

📁 Referensi:

* `controllers/auth.controller.js`
* `middlewares/auth.middleware.js`
* `middlewares/verifyOtp.middleware.js`

---

### 🗂️ Manajemen Data

* CRUD Kategori
* CRUD Produk (dengan upload gambar)

📁 Referensi:

* `controllers/category.controller.js`
* `controllers/product.controller.js`

---

### 💳 Transaksi & Pembayaran

* Transaksi POS (Cash / Midtrans)
* Integrasi Midtrans Snap
* Callback & status pembayaran

📁 Referensi:

* `controllers/transaction.controller.js`
* `controllers/midtrans.controller.js`
* `config/midtrans.config.js`

---

### 📊 Laporan

* Laporan transaksi (Admin & Cashier)
* Filter berdasarkan tanggal & metode pembayaran

📁 Referensi:

* `controllers/report.controller.js`

---

### ☁️ Upload & Storage

* Upload file menggunakan **Multer**
* Penyimpanan object menggunakan **MinIO**

📁 Referensi:

* `config/multer.config.js`
* `config/minio.config.js`
* Direktori `uploads/`

---

### 📧 Email Service

* Pengiriman OTP & notifikasi via SMTP

📁 Referensi:

* `config/mailer.config.js`

---

### ✅ Validasi & Error Handling

* Validasi input request
* Global error handler

📁 Referensi:

* `middlewares/validation.middleware.js`
* `middlewares/errorHandler.middleware.js`

---

## 🛠️ Teknologi yang Digunakan

* **Node.js**
* **Express.js**
* **Prisma ORM**
* **PostgreSQL / MySQL** (via Prisma)
* **Midtrans Payment Gateway**
* **MinIO Object Storage**
* **Multer**
* **JWT**
* **SMTP Mailer**

Entrypoint aplikasi:

* `index.js`

---

## 📁 Struktur Proyek

```
├── config/          # Konfigurasi (DB, Midtrans, MinIO, Mailer, dll)
├── controllers/     # Controller endpoint
├── middlewares/     # Middleware auth, validation, error handler
├── routes/          # Routing modular
├── services/        # Business logic
├── prisma/          # Prisma schema & migration
├── uploads/         # File upload (default)
├── utils/           # Helper & utilities
├── index.js         # Entrypoint aplikasi
├── package.json
└── .env
```

---

## ⚙️ Persiapan & Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

Buat file `.env` berdasarkan kebutuhan:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Prisma)
DATABASE_URL=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# MinIO
MINIO_ENDPOINT=
MINIO_PORT=
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=

# SMTP Mailer
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false

# Upload
UPLOAD_DIR=uploads
```

📁 Lihat juga:

* `config/env.config.js`

---

### 3. Setup Database (Prisma)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## ▶️ Menjalankan Aplikasi

### Development

```bash
node index.js
```

Pastikan service eksternal berikut sudah berjalan:

* Database
* MinIO
* Midtrans
* SMTP Server

---

## 🔌 Integrasi Eksternal

* **Midtrans**
  Konfigurasi di `config/midtrans.config.js`

* **MinIO**
  Client di `config/minio.config.js`, upload via `multer`

* **Mailer (SMTP)**
  Konfigurasi di `config/mailer.config.js`

* **Prisma ORM**
  Client di `config/prisma.config.js`
  Skema di `prisma/schema.prisma`

---

## 🧩 Arsitektur Aplikasi

* Routing → `routes/`
* Controller → `controllers/`
* Business Logic → `services/`
* Middleware (auth, validation) → `middlewares/`
* Error handling terpusat → `errorHandler.middleware.js`

Struktur ini memudahkan scaling dan maintenance.

---

## 🚀 Pengembangan Lanjutan

* Tambah endpoint baru:

  1. Buat route di `routes/`
  2. Implementasi di `controllers/`
  3. Logic di `services/`

* Perubahan database:

  ```bash
  npx prisma migrate dev
  ```

---

## 📄 Lisensi
* MIT
---
