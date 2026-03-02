# Analisis Detail Link Analytics Export

## URL: http://localhost:4231/banking/analytics/export?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman ekspor data analitik.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Analytics & Modeling (`/banking/analytics`)
- **Child:** Data Export (`/banking/analytics/export`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini menyediakan antarmuka untuk mengekstrak dataset IFRS 9 dalam format yang dapat diolah lebih lanjut (CSV, Excel, Parquet). Berbeda dengan laporan standar yang berformat PDF/Print-ready, fitur ini fokus pada _Raw Data Availability_.

Fungsi Utama:

1.  **Bulk Extraction:** Mengunduh data level akun (jutaan baris) tanpa _timeout_.
2.  **Custom Query Builder:** Memilih kolom spesifik yang dibutuhkan (misal: hanya butuh PD dan LGD).
3.  **Audit Trail:** Mencatat siapa yang mengunduh data sensitif dan kapan.
4.  **Data Masking:** Menyembunyikan PII (Nama, NIK) untuk user tanpa privilege khusus.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Export Template Gallery**

**Status: CONFIGURATION**

- **Deskripsi:** Daftar template ekspor yang telah didefinisikan (misal: "Monthly ECL Dump", "Regulatory Report LBU").
- **Tabel Utama:** `public.frs9_export_templates` (Database: FRS9PRO)
- **Logika:** Menyimpan definisi query atau nama tabel sumber.

**Query Pattern:**

```sql
SELECT template_id, template_name, source_table, file_format, description
FROM public.frs9_export_templates
WHERE is_active = true
  AND banking_type = 'conventional';
```

---

### ✅ **2. Form: Filter & Parameter**

**Status: INPUT**

- **Deskripsi:** Filter data yang akan diekspor (Tanggal Posisi, Cabang, Segmen).
- **Tabel Utama:** `public.frs9_master_account` (untuk validasi filter).
- **Logika:** Parameter ini akan disuntikkan ke dalam `WHERE` clause query ekspor.

**Query Pattern:**

```sql
-- Validasi ketersediaan data sebelum ekspor
SELECT COUNT(*)
FROM public.frs9_master_account
WHERE prc_date = :selected_date;
```

---

### ✅ **3. Widget: Download Queue (Async Job)**

**Status: MONITORING**

- **Deskripsi:** Memantau status proses ekspor (Queued -> Processing -> Ready).
- **Tabel Utama:** `public.frs9_export_history`
- **Logika:** Karena file bisa sangat besar, proses dilakukan di _background_ (Worker). User akan mendapat link download setelah selesai.

**Query Pattern:**

```sql
SELECT
    job_id, template_name, request_date,
    status, progress_percent, download_url, file_size_mb
FROM public.frs9_export_history
WHERE requested_by = :current_user
ORDER BY request_date DESC;
```

---

### ✅ **4. Widget: Column Selection (Optional)**

**Status: CUSTOMIZATION**

- **Deskripsi:** Memilih kolom mana saja yang ingin dimasukkan ke file output.
- **Tabel Utama:** `public.frs9_export_field_config`
- **Logika:** Mapping nama kolom database ke header file (misal: `outstanding_balance` -> `Gross Carrying Amount`).

**Query Pattern:**

```sql
SELECT field_name, header_label, is_default
FROM public.frs9_export_field_config
WHERE template_id = :selected_template_id
ORDER BY sequence_no;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Modul ini menggunakan tabel manajemen job dan konfigurasi:

1.  `frs9_export_templates`: Definisi dataset.
2.  `frs9_export_history`: Log aktivitas dan link file.
3.  `frs9_export_field_config`: Metadata kolom.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/analytics/export?mode=conventional` adalah pintu keluar data. Keamanan di sini sangat krusial. Sistem harus memastikan bahwa user hanya bisa mengekspor data sesuai dengan _Data Access Rights_ mereka (misal: User Cabang A tidak boleh download data Cabang B).
