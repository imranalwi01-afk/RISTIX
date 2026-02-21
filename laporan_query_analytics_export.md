# Laporan Detail Query & Tabel Analytics Export

## Menu: Data Extraction & Download

**URL:** `http://localhost:4231/banking/analytics/export?mode=conventional`

Berikut adalah rincian teknis query untuk modul ekspor data.

---

### 1. Component: Available Export Templates

- **Nama Sub Menu:** Template List
- **Link Sub Menu:** `/banking/analytics/export`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_export_templates`
- **Deskripsi:** Daftar jenis laporan/data yang tersedia untuk diunduh.
- **Query:**
  ```sql
  SELECT
      id,
      template_code,
      template_name,
      category, -- MASTER_DATA, CALCULATION_RESULT, AUDIT_LOG
      default_format, -- CSV, XLSX, JSON
      estimated_generation_time_sec
  FROM public.frs9_export_templates
  WHERE is_active = true
    AND (banking_type = 'conventional' OR banking_type = 'ALL')
  ORDER BY category, template_name;
  ```

---

### 2. Component: Export History & Status

- **Nama Sub Menu:** My Downloads
- **Link Sub Menu:** `/banking/analytics/export/history`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_export_history`
- **Deskripsi:** Riwayat permintaan ekspor user beserta status dan link download.
- **Query:**
  ```sql
  SELECT
      h.id,
      t.template_name,
      h.request_date,
      h.parameters_json, -- Filter yang digunakan (e.g., Date=2026-01-31)
      h.status,          -- QUEUED, PROCESSING, COMPLETED, FAILED
      h.file_name,
      h.file_size_bytes,
      h.expiration_date
  FROM public.frs9_export_history h
  JOIN public.frs9_export_templates t ON h.template_id = t.id
  WHERE h.requested_by = :user_id
  ORDER BY h.request_date DESC
  LIMIT 20;
  ```

---

### 3. Component: Field Configuration (Metadata)

- **Nama Sub Menu:** Customize Columns
- **Link Sub Menu:** `/banking/analytics/export/fields/{templateId}`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_export_field_config`
- **Deskripsi:** Daftar kolom yang tersedia untuk template tertentu.
- **Query:**
  ```sql
  SELECT
      field_key,
      header_label,
      data_type,
      is_mandatory, -- Kolom kunci yang tidak bisa di-uncheck
      is_pii        -- Penanda data sensitif (untuk masking)
  FROM public.frs9_export_field_config
  WHERE template_id = :template_id
  ORDER BY sequence_order;
  ```

---

### 4. Component: Data Preview (Sample)

- **Nama Sub Menu:** Preview Data
- **Link Sub Menu:** `/banking/analytics/export/preview`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account` (Dynamic Source)
- **Deskripsi:** Menampilkan 5 baris pertama data sebelum diekspor untuk verifikasi.
- **Query:**
  ```sql
  -- Query dinamis tergantung template, contoh untuk Master Account:
  SELECT account_number, customer_name, outstanding_balance, stage
  FROM public.frs9_master_account
  WHERE prc_date = :report_date
    AND banking_type = 'conventional'
  LIMIT 5;
  ```
