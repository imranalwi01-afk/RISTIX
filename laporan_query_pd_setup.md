# Laporan Detail Query & Tabel PD Setup

## Menu: Probability of Default Configuration

**URL:** `http://localhost:4231/banking/collective/pd-setup?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen model PD.

---

### 1. Component: PD Model List

- **Nama Sub Menu:** Model List
- **Link Sub Menu:** `/banking/collective/pd-setup`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_pd_config`
- **Deskripsi:** Daftar model PD yang telah didefinisikan.
- **Query:**
  ```sql
  SELECT
      id,
      model_code,
      model_name,
      method, -- TRANSITION_MATRIX, VINTAGE_ANALYSIS
      period_start,
      period_end,
      is_active,
      last_calculated_date
  FROM public.frs9_imp_ca_pd_config
  WHERE banking_type = 'conventional'
  ORDER BY created_date DESC;
  ```

---

### 2. Component: Transition Matrix Data

- **Nama Sub Menu:** Matrix Editor
- **Link Sub Menu:** `/banking/collective/pd-setup/matrix`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_pd_matrix`
- **Deskripsi:** Nilai persentase perpindahan antar bucket.
- **Query:**
  ```sql
  SELECT
      m.id,
      m.from_bucket_id,
      b1.bucket_label as from_bucket_label,
      m.to_bucket_id,
      b2.bucket_label as to_bucket_label,
      m.migration_rate, -- Nilai % (0.0 - 1.0)
      m.count_accounts  -- Jumlah akun sampel (untuk validasi statistik)
  FROM public.frs9_imp_ca_pd_matrix m
  JOIN public.frs9_imp_ca_bucket_ranges b1 ON m.from_bucket_id = b1.id
  JOIN public.frs9_imp_ca_bucket_ranges b2 ON m.to_bucket_id = b2.id
  WHERE m.pd_config_id = :pd_config_id
  ORDER BY b1.sequence_no, b2.sequence_no;
  ```

---

### 3. Component: FLI Regression Coefficients

- **Nama Sub Menu:** FLI Overlay
- **Link Sub Menu:** `/banking/collective/pd-setup/fli`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_pd_fli_regression`
- **Deskripsi:** Parameter regresi untuk menghubungkan PD dengan makroekonomi.
- **Query:**
  ```sql
  SELECT
      r.variable_id,
      v.variable_name,
      r.coefficient,
      r.p_value,
      r.t_stat
  FROM public.frs9_imp_ca_pd_fli_regression r
  JOIN public.frs9_imp_ca_fli_variables v ON r.variable_id = v.id
  WHERE r.pd_config_id = :pd_config_id;
  ```

---

### 4. Component: Usage Mapping

- **Nama Sub Menu:** Segment Mapping
- **Link Sub Menu:** `/banking/collective/pd-setup`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_segment_config`
- **Deskripsi:** Melihat segmen yang menggunakan model ini.
- **Query:**
  ```sql
  SELECT segment_code, segment_name
  FROM public.frs9_imp_ca_segment_config
  WHERE pd_config_id = :pd_config_id;
  ```
