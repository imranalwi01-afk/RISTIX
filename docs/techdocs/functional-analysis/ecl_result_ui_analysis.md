# Analisis UI/UX: ECL Result Report

## URL: http://localhost:4231/banking/ifrs9-reports/ecl-result?mode=conventional

Dokumen ini menganalisis struktur antarmuka (UI) dan pengalaman pengguna (UX) untuk halaman Laporan Hasil ECL yang dinilai memiliki desain yang baik.

---

## 🎨 STRUKTUR LAYOUT (UI BREAKDOWN)

Halaman ini kemungkinan besar menggunakan pola **"Dashboard-First Reporting"**, di mana pengguna disuguhi ringkasan visual sebelum masuk ke detail data.

### **1. Header & Global Filters (Top Bar)**

- **Komponen:**
  - **Breadcrumbs:** `Banking > IFRS 9 Reports > ECL Result`
  - **Period Selector:** Dropdown Bulan/Tahun (misal: `Jan 2026`).
  - **Mode Badge:** Label `Conventional` (sesuai parameter URL).
  - **Action Buttons:** `Export to Excel`, `Print PDF`, `Recalculate` (jika user memiliki akses).
- **UX Value:** Memberikan konteks instan tentang data apa yang sedang dilihat dan kontrol cepat untuk mengubah periode laporan.

### **2. Key Performance Indicators (KPI Cards)**

- **Posisi:** Baris paling atas di bawah filter.
- **Isi Kartu:**
  1.  **Total ECL (CKPN):** Nilai absolut cadangan kerugian (misal: `IDR 450 M`).
  2.  **Total Exposure:** Total kredit yang diberikan.
  3.  **Coverage Ratio:** Persentase `(Total ECL / Total Exposure) * 100`.
  4.  **MoM Change:** Indikator panah (Naik/Turun) dibanding bulan lalu.
- **UX Value:** _"At a glance"_ visibility. Eksekutif bisa langsung melihat angka kunci tanpa scroll.

### **3. Visualisasi Distribusi (Charts)**

- **Posisi:** Bagian tengah (Middle Section).
- **Jenis Grafik:**
  - **Donut Chart:** Komposisi ECL berdasarkan Stage (Stage 1 vs 2 vs 3).
  - **Bar Chart:** Top 5 Segmen dengan ECL terbesar.
- **UX Value:** Membantu mengidentifikasi anomali atau konsentrasi risiko dengan cepat.

### **4. Data Grid (Detailed Table)**

- **Posisi:** Bagian bawah (Main Content).
- **Kolom Utama:**
  - `Account Number` (Link ke detail akun)
  - `Customer Name`
  - `Segment`
  - `Stage` (1/2/3)
  - `Outstanding Balance`
  - `ECL Amount`
  - `PD` (Probability of Default)
  - `LGD` (Loss Given Default)
- **Fitur Tabel:** Pagination, Sortable Columns, Search Bar.
- **UX Value:** Akses ke data granular untuk audit dan validasi.

---

## 🔍 ANALISIS TEKNIS & QUERY

Di balik UI yang responsif, berikut adalah query yang kemungkinan besar berjalan:

### ✅ **1. Query KPI Cards (Aggregates)**

Mengambil total angka untuk kartu di bagian atas.

```sql
SELECT
    SUM(ecl_amount) as total_ecl,
    SUM(outstanding_balance) as total_exposure,
    (SUM(ecl_amount) / NULLIF(SUM(outstanding_balance), 0)) * 100 as coverage_ratio
FROM public.frs9_ecl_result
WHERE report_period = :selected_period
  AND banking_type = 'conventional';
```

### ✅ **2. Query Chart (Distribution)**

Mengambil data untuk Donut Chart (Stage Allocation).

```sql
SELECT
    stage,
    SUM(ecl_amount) as total_ecl
FROM public.frs9_ecl_result
WHERE report_period = :selected_period
GROUP BY stage
ORDER BY stage;
```

### ✅ **3. Query Data Grid (Pagination)**

Mengambil data tabel dengan limitasi halaman.

```sql
SELECT
    account_number, customer_name, segment_name,
    stage, outstanding_balance, ecl_amount,
    pd_rate, lgd_rate
FROM public.frs9_ecl_result
WHERE report_period = :selected_period
ORDER BY ecl_amount DESC -- Default sort: Risiko terbesar di atas
LIMIT 20 OFFSET :skip_count;
```

---

## 💡 REKOMENDASI PENGEMBANGAN

Jika Anda ingin meningkatkan UI ini lebih lanjut:

1.  **Drill-down Capability:** Klik pada potongan Donut Chart "Stage 3" sebaiknya otomatis memfilter Tabel di bawahnya hanya menampilkan akun Stage 3.
2.  **Trend Analysis:** Tambahkan Sparkline (grafik garis kecil) pada kartu KPI untuk melihat tren 6 bulan terakhir.
3.  **Comparison Mode:** Fitur untuk membandingkan hasil ECL bulan ini vs bulan lalu secara berdampingan (Side-by-side).

## 🎯 KESIMPULAN

UI `ecl-result` disukai karena menyeimbangkan **High-level Overview** (untuk manajemen) dan **Granular Details** (untuk analis) dalam satu layar. Penggunaan warna untuk Stage (misal: Hijau=Stage 1, Kuning=Stage 2, Merah=Stage 3) juga sangat membantu kognisi visual pengguna.
