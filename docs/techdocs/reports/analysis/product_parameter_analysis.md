# Analisis Detail Link Product Parameter

## URL: http://localhost:4231/banking/parameters/product?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi produk perbankan.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Parameter Management (`/banking/parameters`)
- **Child:** Product Parameters (`/banking/parameters/product`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi sebagai master data untuk seluruh produk perbankan (Funding & Lending). Dalam konteks IFRS 9, konfigurasi produk ini sangat penting untuk:

1.  **Segmentasi:** Memetakan produk ke dalam segmen risiko (misal: KPR, KTA, KUR).
2.  **GL Mapping:** Menentukan akun GL untuk jurnal otomatis (jika terintegrasi).
3.  **ECL Calculation:** Menentukan metode perhitungan bunga (EIR) dan jadwal pembayaran.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Product List (Master Data)**

**Status: CORE ENTITY**

- **Deskripsi:** Daftar seluruh produk aktif beserta kode dan tipenya.
- **Tabel Utama:** `core.banking_products`
- **Logika:** Filter `banking_type = 'conventional'` diterapkan untuk memisahkan produk Syariah.

**Query Pattern:**

```sql
SELECT product_code, product_name, product_type, product_group
FROM core.banking_products
WHERE banking_type = 'conventional'
ORDER BY product_code;
```

---

### ✅ **2. Form: Product Configuration (Detail)**

**Status: ATTRIBUTE SETTING**

- **Deskripsi:** Detail konfigurasi seperti mata uang, metode bunga, dan tenor maks.
- **Tabel Utama:** `core.banking_products`
- **Logika:** Mengambil satu record berdasarkan `product_code`.

**Query Pattern:**

```sql
SELECT
    product_code, product_name, currency_code,
    interest_method, min_tenor, max_tenor,
    is_active
FROM core.banking_products
WHERE product_code = :selected_code;
```

---

### ✅ **3. Widget: GL Mapping (Accounting Link)**

**Status: INTEGRATION**

- **Deskripsi:** Pemetaan kode produk ke akun GL (General Ledger) untuk Principal, Interest, dan Impairment (CKPN).
- **Tabel Utama:** `core.product_gl_mapping` (atau kolom JSON di tabel produk).
- **Logika:** Menentukan pos akuntansi untuk PSAK 71/IFRS 9.

**Query Pattern:**

```sql
SELECT event_type, gl_account_code, gl_account_name
FROM core.product_gl_mapping
WHERE product_code = :selected_code;
```

---

### ✅ **4. Widget: Segment Mapping (Risk Association)**

**Status: IFRS9 SPECIFIC**

- **Deskripsi:** Informasi ke segmen mana produk ini dipetakan dalam perhitungan ECL.
- **Tabel Utama:** `public.frs9_imp_ca_segment_config` (Database: FRS9PRO)
- **Logika:** Join antara tabel produk dan konfigurasi segmen.

**Query Pattern:**

```sql
SELECT s.segment_name, s.segment_type
FROM public.frs9_imp_ca_segment_config s
WHERE s.product_code_filter LIKE '%' || :product_code || '%';
```

---

## 📊 RINGKASAN SKEMA DATABASE

Halaman ini menggabungkan data master dari schema `core` dan konfigurasi risiko dari `public` (FRS9PRO):

1.  **Schema `core`** (Database: Platform/FRS9PRO):
    - `banking_products`: Tabel utama definisi produk.
    - `product_gl_mapping`: Tabel relasi ke akuntansi.
2.  **Schema `public`** (Database: FRS9PRO):
    - `frs9_imp_ca_segment_config`: Konfigurasi segmentasi IFRS 9.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/parameters/product?mode=conventional` adalah titik awal definisi portofolio.

Kesalahan konfigurasi di sini (misal: salah `product_type`) akan menyebabkan akun tidak masuk ke dalam bucket segmentasi yang benar saat proses kalkulasi ECL (End-to-End Process).

````

### 2. Laporan Query Spesifik Product Parameter

```diff
````
