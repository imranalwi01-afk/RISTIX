# Analisis Detail Link ECL Configuration

## URL: http://localhost:4231/banking/collective/ecl-config?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi mesin kalkulasi _Expected Credit Loss (ECL)_.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Collective Impairment (`/banking/collective`)
- **Child:** ECL Configuration / Calculation Engine (`/banking/collective/ecl-config`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi untuk mendefinisikan parameter eksekusi kalkulasi ECL. Di sini user menentukan "Resep" perhitungan yang akan dijalankan pada akhir bulan.

Fungsi Utama:

1.  **Model Binding:** Memastikan setiap segmen memiliki pasangan model PD, LGD, dan EAD yang lengkap.
2.  **Parameter Global:** Menentukan tanggal laporan, metode diskonto (EIR), dan skenario ekonomi yang dipakai.
3.  **Execution Control:** Memicu proses batch kalkulasi.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Calculation Run Profile**

**Status: CORE CONFIGURATION**

- **Deskripsi:** Profil konfigurasi untuk proses running (misal: "ECL Akhir Bulan Januari 2026").
- **Tabel Utama:** `public.frs9_imp_ca_run_config` (Database: FRS9PRO)
- **Logika:** Menyimpan parameter global seperti `report_date`, `scenario_set_id`, dan `run_type` (Simulation/Production).

**Query Pattern:**

```sql
SELECT run_id, run_name, report_date, status, run_type
FROM public.frs9_imp_ca_run_config
WHERE banking_type = 'conventional'
ORDER BY report_date DESC;
```

---

### ✅ **2. Widget: Model Completeness Check**

**Status: VALIDATION**

- **Deskripsi:** Validasi apakah semua segmen aktif sudah memiliki model PD, LGD, dan EAD yang terpasang.
- **Tabel Utama:** `public.frs9_imp_ca_segment_config`
- **Logika:** Mencari segmen dimana `pd_config_id`, `lgd_config_id`, atau `ead_config_id` bernilai NULL.

**Query Pattern:**

```sql
SELECT segment_name, pd_config_id, lgd_config_id, ead_config_id
FROM public.frs9_imp_ca_segment_config
WHERE is_active = true
  AND (pd_config_id IS NULL OR lgd_config_id IS NULL OR ead_config_id IS NULL);
```

---

### ✅ **3. Widget: Discounting Method**

**Status: PARAMETER**

- **Deskripsi:** Pengaturan metode diskonto untuk menarik nilai masa depan ke masa kini (Present Value).
- **Tabel Utama:** `public.frs9_imp_ca_run_params`
- **Logika:** Pilihan antara `ORIGINAL_EIR`, `CURRENT_EIR`, atau `MARKET_RATE`.

**Query Pattern:**

```sql
SELECT param_key, param_value
FROM public.frs9_imp_ca_run_params
WHERE run_id = :selected_run_id
  AND param_group = 'DISCOUNTING';
```

---

### ✅ **4. Widget: Execution History & Logs**

**Status: MONITORING**

- **Deskripsi:** Riwayat eksekusi kalkulasi sebelumnya beserta status keberhasilannya.
- **Tabel Utama:** `public.job_executions` (atau tabel history spesifik ECL).
- **Logika:** Menampilkan durasi proses dan jumlah akun yang diproses.

**Query Pattern:**

```sql
SELECT
    job_instance_id, start_time, end_time,
    status, exit_message,
    total_records_processed
FROM public.frs9_calc_history
WHERE run_config_id = :selected_run_id
ORDER BY start_time DESC;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Data konfigurasi engine tersimpan di database **FRS9PRO** (Schema `public`):

1.  `frs9_imp_ca_run_config`: Header profil running.
2.  `frs9_imp_ca_run_params`: Parameter teknis detail.
3.  `frs9_imp_ca_segment_config`: Validasi kelengkapan model.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/collective/ecl-config?mode=conventional` adalah tombol "Start" dari seluruh sistem IFRS 9.

Sebelum proses dijalankan di sini, sistem harus memastikan integritas data (Data Quality) dan kelengkapan model (Model Governance) melalui widget validasi yang tersedia.
