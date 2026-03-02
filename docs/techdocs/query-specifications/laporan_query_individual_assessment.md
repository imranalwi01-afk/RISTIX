# Laporan Detail Query & Tabel Individual Assessment

## Menu: Individual Assessment List

**URL:** `http://localhost:4231/banking/individual/assessment?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen penilaian individual (IA).

---

### 1. Component: Assessment List (Dashboard)

- **Nama Sub Menu:** Assessment List
- **Link Sub Menu:** `/banking/individual/assessment`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ia_header`
- **Deskripsi:** Menampilkan daftar penilaian individual yang ada dalam sistem.
- **Query:**
  ```sql
  SELECT
      h.id as ia_id,
      h.assessment_date,
      h.account_number,
      m.customer_name,
      m.segment_code,
      h.assessment_method, -- DCF, COLLATERAL
      h.stage,             -- 1, 2, 3
      h.final_ecl_amount,
      h.status,            -- DRAFT, SUBMITTED, APPROVED, REJECTED
      h.created_by
  FROM public.frs9_imp_ia_header h
  LEFT JOIN public.frs9_master_account m ON h.account_number = m.account_number AND m.prc_date = h.assessment_date
  WHERE m.banking_type = 'conventional'
  ORDER BY h.assessment_date DESC, h.created_date DESC;
  ```

---

### 2. Component: Eligible Account Search

- **Nama Sub Menu:** Create Assessment
- **Link Sub Menu:** `/banking/individual/assessment/create`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Mencari akun untuk dinilai. Biasanya difilter hanya akun Signifikan atau Impaired.
- **Query:**
  ```sql
  SELECT
      account_number,
      customer_name,
      outstanding_balance,
      currency_code,
      product_code,
      dpd_days,
      impaired_flag
  FROM public.frs9_master_account
  WHERE banking_type = 'conventional'
    AND prc_date = CURRENT_DATE
    AND (outstanding_balance >= 1000000000 OR impaired_flag = true) -- Contoh threshold signifikansi
  ORDER BY outstanding_balance DESC
  LIMIT 50;
  ```

---

### 3. Component: Assessment Detail (Header)

- **Nama Sub Menu:** Assessment Detail
- **Link Sub Menu:** `/banking/individual/assessment/detail`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ia_header`
- **Deskripsi:** Mengambil parameter dasar untuk satu sesi penilaian.
- **Query:**
  ```sql
  SELECT
      id,
      account_number,
      assessment_date,
      effective_interest_rate,
      original_currency,
      exchange_rate,
      prob_weight_best,
      prob_weight_base,
      prob_weight_worst,
      remarks
  FROM public.frs9_imp_ia_header
  WHERE id = :ia_id;
  ```

---

### 4. Component: Workflow History

- **Nama Sub Menu:** Approval Log
- **Link Sub Menu:** `/banking/individual/assessment/log`
- **Database:** `Platform Admin`
- **Skema:** `approval`
- **Nama Tabel:** `approval_history`
- **Deskripsi:** Riwayat status persetujuan.
- **Query:**
  ```sql
  SELECT
      step_name,
      action_type, -- APPROVE, REJECT, REQUEST_CHANGE
      actor_name,
      action_date,
      comments
  FROM approval.approval_history
  WHERE entity_type = 'INDIVIDUAL_ASSESSMENT'
    AND entity_id = :ia_id
  ORDER BY action_date DESC;
  ```
