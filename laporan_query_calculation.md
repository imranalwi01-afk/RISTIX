# Laporan Detail Query & Tabel Calculation Engine

## Menu: Calculation Monitor & Execution

**URL:** `http://localhost:4231/banking/ifrs9/calculations?mode=conventional`

Berikut adalah rincian teknis query untuk monitoring dan eksekusi proses kalkulasi.

---

### 1. Component: Active Job Monitor

- **Nama Sub Menu:** Running Jobs
- **Link Sub Menu:** `/banking/ifrs9/calculations`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `job_executions`
- **Deskripsi:** Memantau job yang sedang berjalan secara real-time.
- **Query:**
  ```sql
  SELECT
      job_instance_id,
      job_name,
      started_by,
      start_time,
      CAST(EXTRACT(EPOCH FROM (NOW() - start_time)) AS INTEGER) as duration_seconds,
      progress_percentage,
      status_message
  FROM public.job_executions
  WHERE status = 'RUNNING'
    AND job_type = 'IFRS9_CALCULATION'
  ORDER BY start_time DESC;
  ```

---

### 2. Component: Execution History List

- **Nama Sub Menu:** History
- **Link Sub Menu:** `/banking/ifrs9/calculations/history`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_calc_history`
- **Deskripsi:** Daftar riwayat kalkulasi yang telah selesai.
- **Query:**
  ```sql
  SELECT
      h.id,
      h.execution_id,
      rc.run_name,
      h.report_date,
      h.start_time,
      h.end_time,
      h.status, -- COMPLETED, FAILED, COMPLETED_WITH_WARNINGS
      h.total_accounts,
      h.total_ecl_amount
  FROM public.frs9_calc_history h
  JOIN public.frs9_imp_ca_run_config rc ON h.run_config_id = rc.id
  WHERE rc.banking_type = 'conventional'
  ORDER BY h.start_time DESC
  LIMIT 50;
  ```

---

### 3. Component: Detailed Process Logs

- **Nama Sub Menu:** Log Viewer
- **Link Sub Menu:** `/banking/ifrs9/calculations/logs/{executionId}`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_process_logs`
- **Deskripsi:** Log detail untuk keperluan audit dan debugging.
- **Query:**
  ```sql
  SELECT
      log_timestamp,
      log_level, -- INFO, WARN, ERROR
      step_name, -- e.g., "PD Calculation - Segment Retail"
      message,
      records_processed
  FROM public.frs9_process_logs
  WHERE execution_id = :execution_id
  ORDER BY log_timestamp ASC;
  ```

---

### 4. Component: Available Run Configurations

- **Nama Sub Menu:** New Calculation
- **Link Sub Menu:** `/banking/ifrs9/calculations/new`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_run_config`
- **Deskripsi:** Mengambil daftar konfigurasi yang siap untuk dijalankan.
- **Query:**
  ```sql
  SELECT
      id,
      run_name,
      report_date,
      run_type,
      description
  FROM public.frs9_imp_ca_run_config
  WHERE status = 'READY'
    AND banking_type = 'conventional'
  ORDER BY report_date DESC;
  ```
