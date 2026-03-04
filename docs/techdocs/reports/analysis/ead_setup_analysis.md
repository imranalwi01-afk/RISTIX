# Analisis Detail Link EAD Setup

## URL: http://localhost:4231/banking/collective/ead-setup?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi model _Exposure At Default (EAD)_.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Collective Impairment (`/banking/collective`)
- **Child:** EAD Setup (`/banking/collective/ead-setup`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi untuk mengelola model estimasi eksposur saat default terjadi. EAD sangat penting untuk produk dengan limit plafon (Revolving) atau _Off-Balance Sheet_.

Rumus Dasar:
`EAD = Outstanding Balance + (CCF * Unused Limit)`

Komponen Utama:

1.  **CCF (Credit Conversion Factor):** Faktor konversi untuk sisa plafon yang belum ditarik.
2.  **Prepayment Rate:** Estimasi pelunasan dipercepat (untuk Term Loan).
3.  **Amortization Schedule:** Jadwal penurunan pokok pinjaman.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: EAD Model Master**

**Status: CORE CONFIGURATION**

- **Deskripsi:** Daftar model EAD yang tersedia.
- **Tabel Utama:** `public.frs9_imp_ca_ead_config` (Database: FRS9PRO)
- **Logika:** Memisahkan model berdasarkan tipe produk (Revolving vs Term Loan).

**Query Pattern:**

```sql
SELECT config_id, model_name, method, ccf_method, status
FROM public.frs9_imp_ca_ead_config
WHERE banking_type = 'conventional'
ORDER BY created_date DESC;
```

---

### ✅ **2. Widget: CCF Parameters (Off-Balance)**

**Status: DATA INPUT**

- **Deskripsi:** Input nilai CCF untuk fasilitas _Committed_ dan _Uncommitted_.
- **Tabel Utama:** `public.frs9_imp_ca_ead_ccf`
- **Logika:** Nilai CCF biasanya 20%, 50%, atau 100% tergantung jenis fasilitas (LC/BG/Overdraft).

**Query Pattern:**

```sql
SELECT
    id, facility_type,
    ccf_percentage,
    description
FROM public.frs9_imp_ca_ead_ccf
WHERE ead_config_id = :selected_config_id
ORDER BY facility_type;
```

---

### ✅ **3. Widget: Prepayment Analysis**

**Status: ANALYTICS**

- **Deskripsi:** Statistik _Constant Prepayment Rate (CPR)_ historis.
- **Tabel Utama:** `public.frs9_imp_ca_ead_prepayment`
- **Logika:** Menghitung rata-rata pelunasan dini tahunan.

**Query Pattern:**

```sql
SELECT
    period_year,
    segment_name,
    actual_prepayment_rate
FROM public.frs9_imp_ca_ead_prepayment
WHERE ead_config_id = :selected_config_id
ORDER BY period_year DESC;
```

---

### ✅ **4. Widget: Segment Mapping**

**Status: ASSOCIATION**

- **Deskripsi:** Menentukan segmen mana yang menggunakan model EAD ini.
- **Tabel Utama:** `public.frs9_imp_ca_segment_config`
- **Logika:** Update kolom `ead_config_id` pada tabel segmen.

**Query Pattern:**

```sql
SELECT segment_name, segment_type
FROM public.frs9_imp_ca_segment_config
WHERE ead_config_id = :selected_config_id;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Data model EAD tersimpan di database **FRS9PRO** (Schema `public`):

1.  `frs9_imp_ca_ead_config`: Header model.
2.  `frs9_imp_ca_ead_ccf`: Parameter CCF.
3.  `frs9_imp_ca_ead_prepayment`: Data prepayment.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/collective/ead-setup?mode=conventional` krusial untuk produk _Revolving_ (Kartu Kredit, Rekening Koran) dan _Trade Finance_. Tanpa CCF yang akurat, bank bisa _under-estimate_ risiko pada fasilitas yang belum ditarik (Unused Limit).
