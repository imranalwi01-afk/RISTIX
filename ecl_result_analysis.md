# Analisis Detail Link ECL Result Report

## URL: http://localhost:4231/banking/ifrs9-reports/ecl-result?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman pelaporan hasil kalkulasi ECL (_Expected Credit Loss_).

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** IFRS 9 Reports (`/banking/ifrs9-reports`)
- **Child:** ECL Result Detail (`/banking/ifrs9-reports/ecl-result`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini adalah "Muara" dari seluruh proses IFRS 9. Setelah konfigurasi PD, LGD, dan EAD dijalankan (di menu _Collective Config_), user memvalidasi angkanya di sini sebelum dibukukan ke jurnal.

Fitur Utama UI:

1.  **Period Selection:** Memilih hasil run berdasarkan tanggal laporan.
2.  **Pivot Summary:** Agregasi dinamis berdasarkan Cabang, Produk, atau Segmen.
3.  **Account Drill-down:** Melihat detail parameter (PD, LGD, EAD) per nasabah.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Run History Selector**

**Status: FILTER UTAMA**

- **Deskripsi:** Dropdown untuk memilih periode pelaporan (misal: "31 Jan 2026", "28 Feb 2026").
- **Tabel Utama:** `public.frs9_imp_ca_run_config`
- **Logika:** Hanya menampilkan run yang statusnya 'COMPLETED'.

**Query Pattern:**

```sql
SELECT run_id, run_name, report_date, total_ecl_amount
FROM public.frs9_imp_ca_run_config
WHERE banking_type = 'conventional'
  AND status = 'COMPLETED'
ORDER BY report_date DESC;
```

---

### ✅ **2. Widget: Executive Summary (Cards)**

**Status: HIGH LEVEL VIEW**

- **Deskripsi:** Menampilkan Total CKPN (ECL), Total Exposure, dan Coverage Ratio.
- **Tabel Utama:** `public.frs9_imp_ca_ecl_sum`
- **Logika:** Mengambil sum dari tabel summary yang sudah diproses sebelumnya (untuk performa cepat).

**Query Pattern:**

```sql
SELECT
    SUM(outstanding_amount) as total_exposure,
    SUM(ecl_amount) as total_ecl,
    (SUM(ecl_amount) / NULLIF(SUM(outstanding_amount), 0)) * 100 as coverage_ratio
FROM public.frs9_imp_ca_ecl_sum
WHERE run_id = :selected_run_id;
```

---

### ✅ **3. Widget: Segmentation Pivot Table**

**Status: ANALYTICS**

- **Deskripsi:** Tabel grid yang menampilkan sebaran ECL berdasarkan Stage (1, 2, 3) dan Kategori Portofolio.
- **Tabel Utama:** `public.frs9_imp_ca_ecl_sum`
- **Logika:** Grouping data berdasarkan dimensi yang dipilih user.

**Query Pattern:**

```sql
SELECT
    segment_name,
    stage,
    COUNT(account_number) as total_accounts,
    SUM(outstanding_amount) as exposure,
    SUM(ecl_amount) as ecl_value
FROM public.frs9_imp_ca_ecl_sum
WHERE run_id = :selected_run_id
GROUP BY segment_name, stage
ORDER BY segment_name, stage;
```

---

### ✅ **4. Widget: Account Detail List (Data Grid)**

**Status: GRANULAR DATA**

- **Deskripsi:** Daftar detail per rekening lengkap dengan komponen perhitungan (PD%, LGD%, EAD).
- **Tabel Utama:** `public.frs9_imp_ca_ecl_result` (Tabel Detail)
- **Logika:** Pagination server-side wajib digunakan karena data bisa mencapai jutaan baris.

**Query Pattern:**

```sql
SELECT
    r.account_number, m.customer_name,
    r.stage, r.bucket_id,
    r.pd_rate, r.lgd_rate, r.ead_amount,
    r.final_ecl
FROM public.frs9_imp_ca_ecl_result r
JOIN public.frs9_master_account m ON r.account_number = m.account_number
WHERE r.run_id = :selected_run_id
ORDER BY r.final_ecl DESC
LIMIT 20 OFFSET :page_offset;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Halaman ini sangat bergantung pada hasil batch process:

1.  **`frs9_imp_ca_run_config`**: Header proses.
2.  **`frs9_imp_ca_ecl_sum`**: Tabel agregat (kecil, cepat diakses untuk grafik/summary).
3.  **`frs9_imp_ca_ecl_result`**: Tabel detail (besar, menyimpan snapshot PD/LGD/EAD per akun pada saat run dilakukan).

## 🎯 KESIMPULAN

UI `http://localhost:4231/banking/ifrs9-reports/ecl-result` terasa responsif karena kemungkinan besar menggunakan strategi **"Summary First, Detail Later"**.

Sistem meload data dari tabel `_sum` terlebih dahulu untuk menampilkan angka-angka besar, dan baru melakukan query ke tabel `_result` (yang berat) ketika user melakukan pencarian spesifik atau pindah ke tab "Detail".
