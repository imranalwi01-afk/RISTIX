# Laporan Detail Query & Tabel Rule Base

## Menu: Staging & SICR Rules

**URL:** `http://localhost:4231/banking/collective/rule-base?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen aturan staging (Stage Allocation).

---

### 1. Component: Rule Set List

- **Nama Sub Menu:** Rule Configuration
- **Link Sub Menu:** `/banking/collective/rule-base`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_rule_config`
- **Deskripsi:** Daftar konfigurasi aturan staging yang tersedia.
- **Query:**
  ```sql
  SELECT
      id,
      rule_code,
      rule_name,
      description,
      is_default,
      created_date,
      updated_date
  FROM public.frs9_imp_ca_rule_config
  WHERE banking_type = 'conventional'
    AND is_active = true
  ORDER BY is_default DESC, rule_name;
  ```

---

### 2. Component: Staging Logic Details

- **Nama Sub Menu:** Rule Editor
- **Link Sub Menu:** `/banking/collective/rule-base/edit`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_rule_logic`
- **Deskripsi:** Detail kondisi untuk setiap perpindahan stage (1->2, 2->3, dll).
- **Query:**
  ```sql
  SELECT
      id,
      rule_id,
      transition_type, -- STAGE_1_TO_2, STAGE_2_TO_3, CURE_2_TO_1
      parameter_name,  -- DPD, RATING, WATCHLIST
      operator,        -- GT, LT, EQ
      parameter_value,
      logical_connector -- AND, OR
  FROM public.frs9_imp_ca_rule_logic
  WHERE rule_id = :rule_id
  ORDER BY transition_type, sequence_order;
  ```

---

### 3. Component: Associated Segments

- **Nama Sub Menu:** Usage Mapping
- **Link Sub Menu:** `/banking/collective/rule-base`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_segment_config`
- **Deskripsi:** Melihat segmen mana saja yang terpengaruh jika aturan ini diubah.
- **Query:**
  ```sql
  SELECT segment_code, segment_name, segment_type
  FROM public.frs9_imp_ca_segment_config
  WHERE rule_id = :rule_id
  ORDER BY segment_name;
  ```

---

### 4. Component: Staging Simulation Preview

- **Nama Sub Menu:** Impact Analysis
- **Link Sub Menu:** `/banking/collective/rule-base/simulate`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Menghitung distribusi stage berdasarkan aturan yang sedang diedit (sebelum save).
- **Query:**
  ```sql
  -- Query ini biasanya dibentuk dinamis oleh backend berdasarkan rule logic
  SELECT
      CASE
          WHEN dpd_days > 90 THEN 'Stage 3'
          WHEN dpd_days > 30 THEN 'Stage 2'
          ELSE 'Stage 1'
      END as simulated_stage,
      COUNT(*) as account_count,
      SUM(outstanding_balance) as total_exposure
  FROM public.frs9_master_account
  WHERE prc_date = CURRENT_DATE
    AND banking_type = 'conventional'
  GROUP BY 1
  ORDER BY 1;
  ```
