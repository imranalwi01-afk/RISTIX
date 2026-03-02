# Laporan Detail Query & Tabel ECL Configuration

## Menu: Calculation Engine Setup

**URL:** `http://localhost:4231/banking/collective/ecl-config?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen konfigurasi kalkulasi ECL.

---

### 1. Component: Run Profile List

- **Nama Sub Menu:** Run Profiles
- **Link Sub Menu:** `/banking/collective/ecl-config`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_run_config`
- **Deskripsi:** Daftar profil konfigurasi untuk eksekusi ECL (Bulanan/Harian/Simulasi).
- **Query:**
  ```sql
  SELECT
      id,
      run_name,
      description,
      report_date, -- Tanggal posisi data (e.g., 31 Jan 2026)
      run_type,    -- PRODUCTION / SIMULATION
      status,      -- DRAFT, READY, COMPLETED
      created_by
  FROM public.frs9_imp_ca_run_config
  WHERE banking_type = 'conventional'
  ORDER BY report_date DESC, created_date DESC;
  ```

---

### 2. Component: Segment Model Validation

- **Nama Sub Menu:** Model Mapping Check
- **Link Sub Menu:** `/banking/collective/ecl-config/validate`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_segment_config`
- **Deskripsi:** Memastikan setiap segmen memiliki model PD, LGD, dan EAD yang valid sebelum run.
- **Query:**
  ```sql
  SELECT
      s.segment_name,
      pd.model_name as pd_model,
      lgd.model_name as lgd_model,
      ead.model_name as ead_model,
      CASE
          WHEN s.pd_config_id IS NOT NULL
           AND s.lgd_config_id IS NOT NULL
           AND s.ead_config_id IS NOT NULL THEN 'READY'
          ELSE 'INCOMPLETE'
      END as readiness_status
  FROM public.frs9_imp_ca_segment_config s
  LEFT JOIN public.frs9_imp_ca_pd_config pd ON s.pd_config_id = pd.id
  LEFT JOIN public.frs9_imp_ca_lgd_config lgd ON s.lgd_config_id = lgd.id
  LEFT JOIN public.frs9_imp_ca_ead_config ead ON s.ead_config_id = ead.id
  WHERE s.is_active = true
  ORDER BY readiness_status, s.segment_name;
  ```

---

### 3. Component: Calculation Parameters

- **Nama Sub Menu:** Engine Parameters
- **Link Sub Menu:** `/banking/collective/ecl-config/params`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_run_params`
- **Deskripsi:** Parameter teknis seperti threshold materialitas atau metode pembulatan.
- **Query:**
  ```sql
  SELECT param_key, param_value, description
  FROM public.frs9_imp_ca_run_params
  WHERE run_config_id = :run_config_id;
  ```

---

### 4. Component: Execution Logs

- **Nama Sub Menu:** Run History
- **Link Sub Menu:** `/banking/collective/ecl-config/history`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_calc_history`
- **Deskripsi:** Log hasil eksekusi kalkulasi.
- **Query:**
  ```sql
  SELECT
      execution_id,
      start_time,
      end_time,
      duration_seconds,
      total_accounts,
      total_ecl_amount,
      status,
      error_log
  FROM public.frs9_calc_history
  WHERE run_config_id = :run_config_id
  ORDER BY start_time DESC;
  ```
