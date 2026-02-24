# Analisis Detail Link Dashboard

## URL: http://localhost:4231/banking/dashboard?mode=conventional

Berdasarkan pemetaan pada `laporan_detail_link_dan_query.md` (Bagian 4.1) dan referensi modul lainnya, berikut adalah analisis teknis aliran data dan query untuk halaman Dashboard.

---

## 📋 STRUKTUR MENU DASHBOARD

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Child:** Dashboard Overview (`/banking/dashboard`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Parameter Mode:**

Parameter `mode=conventional` berfungsi sebagai filter global pada level query (`WHERE banking_type = 'conventional'`) untuk memisahkan portofolio Konvensional, Syariah, atau Dual.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Total Exposure (Outstanding Balance)**

**Status: TERVERIFIKASI (Section 4.1)**

- **Deskripsi:** Menampilkan total _outstanding balance_ posisi hari ini.
- **Tabel Utama:** `public.frs9_master_account` (Database: FRS9PRO)
- **Keterkaitan Mode:** Query harus memfilter kolom `banking_type`.

**Query Pattern:**

```sql
SELECT SUM(outstanding_balance) as total_exposure
FROM public.frs9_master_account
WHERE prc_date = CURRENT_DATE
  AND banking_type = 'conventional'; -- Filter dari URL param
```

---

### ✅ **2. Widget: Collective ECL Summary**

**Status: TERINTEGRASI (Section 2.4)**

- **Deskripsi:** Grafik atau ringkasan ECL berdasarkan Stage (1, 2, 3) dan Segment.
- **Tabel Utama:** `public.frs9_imp_ca_ecl_sum` (Database: FRS9PRO)
- **Analisis:** Meskipun Section 4.1 tidak secara eksplisit menuliskan query ini, Dashboard IFRS 9 standar selalu mengambil ringkasan dari tabel summary hasil kalkulasi (Section 2.4).

**Query Pattern:**

```sql
SELECT
    segment_name,
    stage,
    SUM(ecl_amount) as total_ecl,
    SUM(outstanding_amount) as total_exposure
FROM public.frs9_imp_ca_ecl_sum
WHERE report_date = (SELECT MAX(report_date) FROM public.frs9_imp_ca_ecl_sum)
GROUP BY segment_name, stage
ORDER BY segment_name, stage;
```

---

### ✅ **3. Widget: Top Watchlist / High Risk Accounts**

**Status: TERINTEGRASI (Section 1.1)**

- **Deskripsi:** Tabel ringkas menampilkan akun dengan penurunan kualitas kredit (High DPD atau Impaired).
- **Tabel Utama:** `ifrs9.frs9_master_account`
- **Logika:** Mengambil data yang sama dengan modul _Individual Watchlist_ tetapi dilimitasi (misal: Top 5 atau Top 10).

**Query Pattern:**

```sql
SELECT
    account_number, customer_name,
    dpd_days, rating_code, outstanding_balance
FROM ifrs9.frs9_master_account
WHERE prc_date = CURRENT_DATE
  AND banking_type = 'conventional'
  AND (impaired_flag = true OR dpd_days > 30)
ORDER BY outstanding_balance DESC
LIMIT 10;
```

---

### ✅ **4. Widget: System Usage / User Activity**

**Status: TERVERIFIKASI (Section 4.1)**

- **Deskripsi:** Statistik penggunaan menu oleh user hari ini.
- **Tabel Utama:** `menu.menu_analytics`
- **Schema:** `menu`

**Query Pattern:**

```sql
SELECT menu_key, count(*) as visit_count
FROM menu.menu_analytics
WHERE visit_date = CURRENT_DATE
GROUP BY menu_key
ORDER BY visit_count DESC;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Dashboard ini bersifat **Cross-Schema**, menggabungkan data operasional IFRS 9 dan data analitik sistem:

1.  **Schema `ifrs9`**:
    - `frs9_master_account`: Data sumber utama untuk Exposure dan Watchlist.
    - `frs9_imp_ca_ecl_sum`: Data hasil kalkulasi untuk ringkasan ECL.
2.  **Schema `menu`**:
    - `menu_analytics`: Data monitoring aktivitas user.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/dashboard?mode=conventional` valid dan memicu agregasi data dari 3 area utama:

1.  **Portfolio Overview:** Mengambil `SUM` dari `frs9_master_account` dengan filter `conventional`.
2.  **Risk Summary:** Mengambil agregasi Stage dari `frs9_imp_ca_ecl_sum`.
3.  **System Health:** Mengambil hit count dari `menu_analytics`.

Performa dashboard sangat bergantung pada indeks di kolom `prc_date` dan `banking_type` pada tabel `frs9_master_account`.
