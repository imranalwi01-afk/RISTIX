# Analisis Detail Link Application Setup

## URL: http://localhost:4231/banking/setup/application?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi aplikasi utama.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** System Setup (`/banking/setup`)
- **Child:** Application Configuration (`/banking/setup/application`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi sebagai pusat kontrol konfigurasi global aplikasi untuk tenant yang sedang aktif. Pengaturan ini mempengaruhi perilaku sistem secara keseluruhan, seperti tanggal sistem, format mata uang, dan status pemrosesan harian (EOD).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Form: General Application Settings**

**Status: CORE CONFIGURATION**

- **Deskripsi:** Pengaturan dasar aplikasi seperti Nama Aplikasi, Format Tanggal, Timezone, dan Bahasa Default.
- **Tabel Utama:** `platform_admin.configuration`
- **Logika:** Mengambil konfigurasi dengan kategori 'GENERAL' atau 'APP_SETTINGS'.

**Query Pattern:**

```sql
SELECT config_key, config_value, description
FROM platform_admin.configuration
WHERE category = 'GENERAL'
  AND is_active = true;
```

---

### ✅ **2. Form: System Date & Accounting Period**

**Status: CRITICAL**

- **Deskripsi:** Menampilkan dan mengatur Tanggal Proses (Current Business Date) dan Periode Akuntansi yang sedang berjalan.
- **Tabel Utama:** `platform_admin.configuration` (Key spesifik)
- **Logika:** Nilai ini dikunci (read-only) jika proses EOD sedang berjalan.

**Query Pattern:**

```sql
SELECT config_value as current_date
FROM platform_admin.configuration
WHERE config_key = 'SYSTEM_DATE';
```

---

### ✅ **3. Widget: End of Day (EOD) Status**

**Status: MONITORING**

- **Deskripsi:** Status proses batch terakhir (Success/Failed/Running).
- **Tabel Utama:** `public.job_executions` (Database: FRS9PRO/Platform)
- **Logika:** Mengambil status eksekusi job terakhir untuk tipe 'EOD_PROCESS'.

**Query Pattern:**

```sql
SELECT status, start_time, end_time, exit_message
FROM public.job_executions
WHERE job_name = 'EOD_BATCH_CONVENTIONAL'
ORDER BY start_time DESC
LIMIT 1;
```

---

### ✅ **4. Form: Tenant Profile**

**Status: INFO**

- **Deskripsi:** Informasi lisensi dan profil tenant (Bank Name, Logo, Address).
- **Tabel Utama:** `platform_admin.tenants`
- **Logika:** Mengambil data tenant berdasarkan session user yang login.

**Query Pattern:**

```sql
SELECT name, code, license_type, status
FROM platform_admin.tenants
WHERE id = :current_tenant_id;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Halaman ini mengakses data administratif dari schema `platform_admin` dan status job dari `public`:

1.  **Schema `platform_admin`**:
    - `configuration`: Penyimpanan Key-Value untuk parameter sistem dinamis.
    - `tenants`: Data profil entitas bank.
2.  **Schema `public`**:
    - `job_executions`: Log eksekusi proses batch (EOD).

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/setup/application?mode=conventional` adalah halaman **Admin Control Panel**.

Perubahan pada halaman ini memiliki dampak **High Risk** karena mengubah parameter global (`SYSTEM_DATE`, `APP_MODE`). Validasi permission user (Role: Super Admin) sangat ketat pada endpoint ini.

````

### 2. Laporan Query Spesifik (`laporan_query_application_setup.md`)

```diff
````
