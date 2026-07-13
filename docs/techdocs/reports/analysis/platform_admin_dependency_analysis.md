# Analisis Detail Ketergantungan Aplikasi pada Database Platform Admin

Berdasarkan penelusuran menyeluruh pada _codebase_ backend (terutama di `packages/new-backend/src`), berikut adalah temuan teknis mengenai bagian aplikasi mana saja yang **masih** mengarah dan berinteraksi dengan database Platform Admin (`platformDb` / `ifrspro_platform_admin`).

---

## 🔍 Temuan Utama Konflik dengan Asumsi Sebelumnya

Pada dokumen `application_setup_analysis.md`, disebutkan bahwa halaman **Application Configuration** (`/banking/setup/application`) mengakses tabel `core.configuration` dari schema `platform_admin`.

**Faktanya, hal ini sudah tidak berlaku di implementasi backend saat ini.**

1. **Application Settings (Parameter Setup):**
   - Route `/banking/setup/application` dan API `/api/v1/app-settings` dikelola oleh `app-settings.routes.ts` dan `parameters.service.ts`.
   - Modul ini **TIDAK** mengambil data dari `platform_admin`. Sebaliknya, modul ini menggunakan koneksi `legacyDb` dan mengakses secara langsung tabel `FRS9_PARAM_COMMONH` dan `FRS9_PARAM_COMMOND` di database _legacy_ Bank (tenant khusus).
   - Hal ini sudah sesuai dengan **Aturan: Legacy Schema Enforcement** untuk tabel dengan prefix `frs9_`.

---

## 🏗️ Komponen yang MASIH Terhubung ke DB Platform Admin

Berikut adalah daftar aktual dari modul, _services_, dan komponen yang secara definitif masih melakukan koneksi ke database Platform Admin.

### 1. Platform Dashboard & System Monitoring (`/platform-admin/*`)

Modul ini adalah pusat kontrol utama untuk _Super Admin_ guna memantau _health_ dan statistik platform multi-tenant.

- **Service Utama:** `platform-admin.service.ts`
- **Koneksi Engine:** Drizzle ORM (`import { db } from '@/config'`) -> Mengarah ke `platformDb`.
- **Tabel yang Diakses:**
  - `platform.tenants` (Mengambil daftar tenant bank yang aktif).
  - `platform.users` (Akses Super Admin platform).
  - `platform.roles` (Role management global).
  - `platform.audit_logs` (Pencatatan aktivitas lintas platform).
  - `platform.sessions` (Monitoring sesi login admin global).

### 2. Job & Batch Execution Monitoring (`/jobs/*`)

Fitur untuk memantau proses _End of Day_ (EOD) dan job _background_ lainnya, seperti yang ditampilkan di Widget "End of Day Status".

- **Repository Utama:** `jobs.repository.ts`
- **Koneksi Engine:** Menggunakan koneksi _direct PostgreSQL client_ secara eksplisit (Drizzle _bypassed_) ke `postgresql://postgres:postgres@172.25.0.25:5432/ifrspro_platform_admin`.
- **Tabel yang Diakses:**
  - `core.job_executions`
  - `core.job_definitions`
- **Fungsi:** Untuk menarik status (`RUNNING`, `FAILED`, `SUCCESS`), waktu mulai, rentang durasi kerja `EOD_BATCH_CONVENTIONAL`, dan statistik harian.

### 3. Modul Autentikasi Super Admin (`/auth/login`)

Sistem autentikasi membagi target verifikasi berdasarkan tipe user. Jika tipe loginnya untuk _manajemen platform_, autentikasi diarahkan ke database platform.

- **Service Utama:** `auth.service.ts`
- **Middleware:** `auth.ts`
- **Tabel yang Diakses:** `platform.users`
- **Fungsi:** Validasi kredensial (seperti pengecekan akun _Platform Super Admin_). Jika user biasa (Maker/Checker bank), autentikasi mengarah ke `legacyDb` (tabel tenant terkait).

### 4. Skrip Pemeliharaan Lokal (Ops / Seeds)

Ada berbagai macam _scripts_ operasional yang dipakai oleh _engineer_ dengan akses langsung ke Platform DB.

- **File terkait:**
  - `scripts/ops/reset-password.ts`
  - `scripts/ops/create-platform-admin.ts`
  - `db/seeds/setup-maker-checker-iaf.ts`

---

## 🎯 Kesimpulan & Rekomendasi

1. **Aman dari Modifikasi Parameter Tenant:** Modifikasi parameter aplikasi tenant (via UI _Application Setup_) **sudah tidak berdampak** pada konfigurasi global platform (karena terhubung ke tabel Legacy _Bank_ secara spesifik: `FRS9_PARAM_COMMONH`). Asumsi di awal bahwa _General Application Settings_ mengubah data global tenant di Platform DB dapat diabaikan.
2. **Ketergantungan EOD pada Platform DB:** Widget status EOD di halaman UI tetap benar membaca data dari schema `core` di `platform_admin`. Logika ini dikelola langsung melalui query _raw_ di `jobs.repository.ts`.
3. Jika dituntut untuk mengisolasi DB Tenant dan DB Platform secara total, pastikan status EOD (`job_executions`) tetap direplikasi atau dimanajemen melalui antarmuka _Queue_ independen, membatasi dependensi langsung tenant ke Platform DB.
