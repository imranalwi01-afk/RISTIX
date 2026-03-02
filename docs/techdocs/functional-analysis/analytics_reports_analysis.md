# Analisis Detail Link Analytics Reports

## URL: http://localhost:4231/banking/analytics/reports?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman laporan analitik portofolio (MIS/Business Intelligence).

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Analytics & Modeling (`/banking/analytics`)
- **Child:** Portfolio Reports (`/banking/analytics/reports`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini menyediakan wawasan mendalam mengenai komposisi dan kualitas portofolio kredit di luar standar pelaporan akuntansi IFRS 9.

Jenis Laporan Umum:

1.  **Concentration Risk:** Analisis paparan risiko berdasarkan sektor ekonomi, wilayah, atau grup nasabah.
2.  **Vintage Analysis:** Melacak kinerja kredit berdasarkan tahun/bulan pencairan (Cohort Analysis).
3.  **Transition Matrix:** Visualisasi perpindahan kolektibilitas antar periode.
4.  **Risk Adjusted Return (RAROC):** Analisis profitabilitas setelah memperhitungkan biaya risiko (ECL).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Report Catalog**

**Status: LIBRARY**

- **Deskripsi:** Daftar laporan analitik yang tersedia untuk digenerate.
- **Tabel Utama:** `public.frs9_analytics_catalog` (Database: FRS9PRO)
- **Logika:** Mengelompokkan laporan berdasarkan kategori (Risk, Profitability, Operational).

**Query Pattern:**

```sql
SELECT report_id, report_name, category, description, visualization_type
FROM public.frs9_analytics_catalog
WHERE is_active = true
ORDER BY category, report_name;
```

---

### ✅ **2. Widget: Parameter Form**

**Status: INPUT**

- **Deskripsi:** Form dinamis untuk filter laporan (Tanggal, Segmen, Cabang).
- **Tabel Utama:** `public.frs9_analytics_report_params`
- **Logika:** Setiap laporan memiliki set parameter yang berbeda (disimpan dalam JSON atau tabel relasi).

**Query Pattern:**

```sql
SELECT param_code, param_label, data_type, default_value
FROM public.frs9_analytics_report_params
WHERE report_id = :selected_report_id
ORDER BY sequence_order;
```

---

### ✅ **3. Widget: Visualization Viewer**

**Status: OUTPUT**

- **Deskripsi:** Area utama untuk menampilkan grafik (Bar, Line, Pie, Heatmap) dan tabel data.
- **Tabel Utama:** `public.frs9_master_account` (Aggregated)
- **Logika:** Query dijalankan secara _On-Demand_ atau mengambil dari _Materialized View_ untuk performa.

**Query Pattern (Contoh Concentration Risk):**

```sql
SELECT
    economic_sector,
    SUM(outstanding_balance) as total_exposure,
    SUM(ecl_amount) as total_risk
FROM public.frs9_master_account
WHERE prc_date = :report_date
GROUP BY economic_sector;
```

---

### ✅ **4. Widget: Export & Scheduling**

**Status: UTILITY**

- **Deskripsi:** Fitur untuk download (PDF/Excel) atau menjadwalkan pengiriman laporan via email.
- **Tabel Utama:** `public.frs9_report_schedules`
- **Logika:** Mengelola cron job untuk generate laporan rutin.

**Query Pattern:**

```sql
SELECT schedule_id, frequency, next_run_time, recipients
FROM public.frs9_report_schedules
WHERE report_id = :selected_report_id;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Modul ini menggunakan tabel konfigurasi dan data transaksi:

1.  `frs9_analytics_catalog`: Definisi laporan.
2.  `frs9_master_account`: Sumber data utama (Granular).
3.  `frs9_analytics_snapshots`: Tabel agregat untuk performa (Data Mart).

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/analytics/reports?mode=conventional` adalah alat bantu pengambilan keputusan strategis. Berbeda dengan laporan IFRS 9 yang fokus pada "Berapa cadangan kita?", laporan ini menjawab "Dimana risiko kita terkonsentrasi?" dan "Segmen mana yang paling menguntungkan?".
