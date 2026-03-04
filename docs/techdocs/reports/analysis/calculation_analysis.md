# Analisis Detail Link Calculation Engine

## URL: http://localhost:4231/banking/ifrs9/calculations?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman monitoring dan eksekusi kalkulasi IFRS 9.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** IFRS 9 Processing (`/banking/ifrs9`)
- **Child:** Calculations / Job Monitor (`/banking/ifrs9/calculations`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini adalah "Control Room" untuk operator sistem. Berbeda dengan halaman konfigurasi (`ecl-config`) yang bersifat setup, halaman ini fokus pada **Runtime Execution**.

Fungsi Utama:

1.  **Real-time Monitoring:** Melihat progress bar kalkulasi yang sedang berjalan.
2.  **Job Control:** Menghentikan (Stop/Kill) proses yang macet.
3.  **Error Analysis:** Melihat log detail jika terjadi kegagalan (misal: data tidak lengkap).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Active Jobs (Running Processes)**

**Status: REAL-TIME MONITORING**

- **Deskripsi:** Menampilkan job yang statusnya sedang `RUNNING` atau `QUEUED`.
- **Tabel Utama:** `public.job_executions` (Database: FRS9PRO)
- **Logika:** Refresh otomatis setiap beberapa detik untuk update progress bar.

**Query Pattern:**

```sql
SELECT job_instance_id, job_name, start_time, progress_percentage, status
FROM public.job_executions
WHERE status IN ('RUNNING', 'QUEUED')
ORDER BY start_time DESC;
```

---

### ✅ **2. Widget: Calculation History**

**Status: HISTORICAL DATA**

- **Deskripsi:** Riwayat eksekusi kalkulasi yang sudah selesai (Success/Failed).
- **Tabel Utama:** `public.frs9_calc_history`
- **Logika:** Menampilkan ringkasan hasil (Total ECL, Total Akun) untuk verifikasi cepat.

**Query Pattern:**

```sql
SELECT
    h.execution_id, c.run_name, h.report_date,
    h.total_accounts, h.total_ecl_amount, h.status
FROM public.frs9_calc_history h
JOIN public.frs9_imp_ca_run_config c ON h.run_config_id = c.id
WHERE c.banking_type = 'conventional'
ORDER BY h.end_time DESC;
```

---

### ✅ **3. Widget: Process Logs (Detail)**

**Status: DIAGNOSTIC**

- **Deskripsi:** Log detail langkah-langkah kalkulasi (Step-by-Step).
- **Tabel Utama:** `public.frs9_process_logs`
- **Logika:** Digunakan untuk debugging. Mencatat setiap step (misal: "Calculating PD...", "Calculating LGD...", "Aggregating Results...").

**Query Pattern:**

```sql
SELECT log_time, log_level, step_name, message
FROM public.frs9_process_logs
WHERE execution_id = :selected_execution_id
ORDER BY log_time ASC;
```

---

### ✅ **4. Form: Trigger New Calculation**

**Status: ACTION**

- **Deskripsi:** Dropdown untuk memilih konfigurasi run yang siap dieksekusi.
- **Tabel Utama:** `public.frs9_imp_ca_run_config`
- **Logika:** Hanya menampilkan konfigurasi dengan status `READY` yang belum dijalankan untuk periode tersebut.

**Query Pattern:**

```sql
SELECT id, run_name, report_date
FROM public.frs9_imp_ca_run_config
WHERE status = 'READY'
  AND banking_type = 'conventional';
```

---

## 📊 RINGKASAN SKEMA DATABASE

Halaman ini berinteraksi dengan tabel runtime di database **FRS9PRO** (Schema `public`):

1.  `job_executions`: Status teknis job (Platform level).
2.  `frs9_calc_history`: Hasil bisnis kalkulasi (IFRS 9 level).
3.  `frs9_process_logs`: Detail log aktivitas.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/ifrs9/calculations?mode=conventional` adalah dashboard operasional harian/bulanan.
Stabilitas halaman ini krusial saat periode pelaporan (End of Month) karena operator memantau penyelesaian proses batch yang memakan waktu lama di sini.
