# Analisis Detail Link Analytics Dashboard

## URL: http://localhost:4231/banking/analytics/dashboard?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman Dashboard Analitik (Strategic View).

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Analytics & Modeling (`/banking/analytics`)
- **Child:** Analytics Dashboard (`/banking/analytics/dashboard`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini menyajikan visualisasi data strategis untuk memantau profil risiko portofolio secara keseluruhan. Berbeda dengan _Operational Dashboard_ yang fokus pada status proses harian, dashboard ini fokus pada tren dan komposisi portofolio.

Fungsi Utama:

1.  **Portfolio Health Check:** Memantau rasio NPL (Non-Performing Loan) dan Coverage Ratio.
2.  **Trend Analysis:** Melihat pergerakan kualitas kredit (migrasi stage) selama 12 bulan terakhir.
3.  **Concentration Risk:** Mengidentifikasi penumpukan risiko pada sektor ekonomi atau wilayah tertentu.
4.  **Risk Appetite Monitoring:** Membandingkan metrik aktual dengan batas toleransi risiko bank.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Key Risk Indicators (KRIs)**

**Status: SUMMARY**

- **Deskripsi:** Kartu metrik utama (Total Exposure, NPL Ratio, Cost of Credit).
- **Tabel Utama:** `public.frs9_master_account` (Current) & `public.frs9_imp_ca_ecl_sum` (Historical).
- **Logika:** Menghitung rasio berdasarkan snapshot data terakhir.

**Query Pattern:**

```sql
SELECT
    SUM(outstanding_balance) as total_exposure,
    SUM(CASE WHEN stage = '3' THEN outstanding_balance ELSE 0 END) / SUM(outstanding_balance) * 100 as npl_ratio,
    SUM(ecl_amount) / SUM(outstanding_balance) * 100 as coverage_ratio
FROM public.frs9_master_account
WHERE prc_date = CURRENT_DATE;
```

---

### ✅ **2. Widget: Asset Quality Trend (12 Months)**

**Status: TIME SERIES**

- **Deskripsi:** Grafik garis yang menunjukkan evolusi saldo per Stage (1, 2, 3) dari waktu ke waktu.
- **Tabel Utama:** `public.frs9_imp_ca_ecl_ts` (Time Series).
- **Logika:** Mengambil data agregat akhir bulan untuk 1 tahun ke belakang.

**Query Pattern:**

```sql
SELECT report_date, stage, total_outstanding
FROM public.frs9_imp_ca_ecl_ts
WHERE report_date >= CURRENT_DATE - INTERVAL '12 months'
ORDER BY report_date, stage;
```

---

### ✅ **3. Widget: Sectoral Concentration (Heatmap/Bar)**

**Status: DISTRIBUTION**

- **Deskripsi:** Distribusi eksposur berdasarkan sektor ekonomi (misal: Pertanian, Manufaktur, Perdagangan).
- **Tabel Utama:** `public.frs9_master_account`
- **Logika:** `GROUP BY economic_sector`.

**Query Pattern:**

```sql
SELECT economic_sector, SUM(outstanding_balance) as exposure
FROM public.frs9_master_account
WHERE prc_date = CURRENT_DATE
GROUP BY economic_sector
ORDER BY exposure DESC
LIMIT 10;
```

---

### ✅ **4. Widget: Weighted Average Risk Grade**

**Status: RISK PROFILE**

- **Deskripsi:** Distribusi rating internal debitur.
- **Tabel Utama:** `public.frs9_master_account`
- **Logika:** Memvisualisasikan profil risiko debitur (Low Risk vs High Risk).

**Query Pattern:**

```sql
SELECT rating_code, COUNT(*) as account_count, SUM(outstanding_balance) as exposure
FROM public.frs9_master_account
WHERE prc_date = CURRENT_DATE
GROUP BY rating_code
ORDER BY rating_code;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Halaman ini menggunakan kombinasi data granular dan agregat:

1.  `frs9_master_account`: Untuk analisis posisi saat ini (Current Position).
2.  `frs9_imp_ca_ecl_ts`: Tabel khusus time-series yang menyimpan history agregat ECL dan Exposure per bulan.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/analytics/dashboard?mode=conventional` memberikan pandangan "Helicopter View" bagi manajemen. Data di sini harus konsisten dengan laporan regulasi, namun disajikan dalam format visual yang memudahkan pengambilan keputusan strategis.
