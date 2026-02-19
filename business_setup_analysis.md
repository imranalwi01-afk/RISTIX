# Analisis Detail Link Business Setup

## URL: http://localhost:4231/banking/setup/business?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi parameter bisnis perbankan.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** System Setup (`/banking/setup`)
- **Child:** Business Configuration (`/banking/setup/business`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi untuk mengatur entitas bisnis fundamental yang digunakan dalam operasional sehari-hari, seperti struktur cabang, mata uang yang didukung, kalender operasional (hari libur), dan pusat biaya (cost centers).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Branch / Network Management**

**Status: CORE ENTITY**

- **Deskripsi:** Daftar kantor cabang dan wilayah operasional bank.
- **Tabel Utama:** `core.branches`
- **Logika:** Menampilkan hierarki cabang (Kantor Pusat, KCP, Unit).

**Query Pattern:**

```sql
SELECT branch_code, branch_name, branch_type, parent_branch_code, status
FROM core.branches
WHERE status = 'ACTIVE'
ORDER BY branch_code;
```

---

### ✅ **2. Widget: Currency & Exchange Rates**

**Status: FINANCIAL PARAMETER**

- **Deskripsi:** Pengaturan mata uang yang aktif dan rate referensi.
- **Tabel Utama:** `core.currencies`
- **Logika:** Mata uang dasar (IDR) biasanya di-flag sebagai `is_local`.

**Query Pattern:**

```sql
SELECT currency_code, currency_name, symbol, is_local, is_active
FROM core.currencies
ORDER BY is_local DESC, currency_code ASC;
```

---

### ✅ **3. Widget: Holiday Calendar**

**Status: OPERATIONAL**

- **Deskripsi:** Kalender hari libur bank untuk perhitungan hari kerja (Business Days).
- **Tabel Utama:** `core.holidays`
- **Logika:** Digunakan untuk menghitung `Next Business Date` dan `DPD` (Days Past Due).

**Query Pattern:**

```sql
SELECT holiday_date, description, is_recurring, holiday_type
FROM core.holidays
WHERE holiday_date >= DATE_TRUNC('year', CURRENT_DATE)
ORDER BY holiday_date;
```

---

### ✅ **4. Widget: Cost Centers / Business Units**

**Status: REPORTING**

- **Deskripsi:** Kode pusat biaya untuk alokasi pembebanan ECL.
- **Tabel Utama:** `core.cost_centers`
- **Logika:** Filter berdasarkan mode (Conventional/Syariah) jika struktur biaya dipisah.

**Query Pattern:**

```sql
SELECT code, name, department, profit_center_code
FROM core.cost_centers
WHERE is_active = true
ORDER BY code;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Halaman ini sangat bergantung pada schema **`core`** yang menyimpan data master perbankan:

1.  **Schema `core`** (Database: Platform/FRS9PRO):
    - `branches`: Struktur organisasi fisik.
    - `currencies`: Standar ISO 4217 mata uang.
    - `holidays`: Kalender operasional.
    - `cost_centers`: Struktur akuntansi manajemen.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/setup/business?mode=conventional` adalah halaman **Master Data Management**.

Data di halaman ini bersifat **Static/Reference Data** yang jarang berubah tetapi sangat kritikal karena direferensikan oleh hampir semua transaksi (Pinjaman, Simpanan, GL).

- **Integritas Data:** Perubahan pada `currency_code` atau `branch_code` dapat merusak integritas referensial tabel transaksi (`frs9_master_account`).
- **Cache:** Data ini idealnya di-cache di sisi aplikasi (Backend/Frontend) untuk performa.

````

### 2. Laporan Query Spesifik Business Setup

```diff
````
