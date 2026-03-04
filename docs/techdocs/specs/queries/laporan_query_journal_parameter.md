# Laporan Detail Query & Tabel Journal Parameter

## Menu: Journal Parameter Configuration

**URL:** `http://localhost:4231/banking/parameters/journal?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen konfigurasi parameter jurnal akuntansi otomatis (Auto-Journal) dalam konteks IFRS 9.

---

### 1. Component: Chart of Accounts (CoA)

- **Nama Sub Menu:** Account List
- **Link Sub Menu:** `/banking/parameters/journal`
- **Database:** `Platform Admin`
- **Skema:** `core`
- **Nama Tabel:** `chart_of_accounts`
- **Deskripsi:** Daftar akun buku besar (GL) yang relevan untuk penjurnalan impairment.
- **Query:**
  ```sql
  SELECT
      account_code,
      account_name,
      account_type,   -- EXPENSE, LIABILITY, INCOME
      currency_code,
      is_active
  FROM core.chart_of_accounts
  WHERE is_active = true
  ORDER BY account_code;
  ```

---

### 2. Component: Journal Event Configuration

- **Nama Sub Menu:** Event List
- **Link Sub Menu:** `/banking/parameters/journal/events`
- **Database:** `Platform Admin`
- **Skema:** `core`
- **Nama Tabel:** `journal_events`
- **Deskripsi:** Daftar kejadian bisnis yang memicu pembuatan jurnal otomatis IFRS 9.
- **Query:**
  ```sql
  SELECT
      event_code,           -- e.g., ECL_MONTHLY_PROVISION, ECL_REVERSAL, WRITE_OFF
      event_name,
      description,
      transaction_type,     -- DR_INCREASE / CR_INCREASE
      is_active
  FROM core.journal_events
  WHERE module = 'IFRS9'
  ORDER BY event_code;
  ```

---

### 3. Component: Journal Template (Dr/Cr Mapping)

- **Nama Sub Menu:** Template Config
- **Link Sub Menu:** `/banking/parameters/journal/templates`
- **Database:** `Platform Admin`
- **Skema:** `core`
- **Nama Tabel:** `journal_templates`
- **Deskripsi:** Aturan pasangan akun Debit/Kredit untuk setiap event penjurnalan per segmen.
- **Query:**
  ```sql
  SELECT
      t.template_code,
      t.event_code,
      t.dr_gl_account,
      dr.account_name as dr_account_name,
      t.cr_gl_account,
      cr.account_name as cr_account_name,
      t.segment_criteria  -- e.g., {"banking_type": "conventional"}
  FROM core.journal_templates t
  LEFT JOIN core.chart_of_accounts dr ON t.dr_gl_account = dr.account_code
  LEFT JOIN core.chart_of_accounts cr ON t.cr_gl_account = cr.account_code
  WHERE t.banking_type = 'conventional'
  ORDER BY t.event_code;
  ```

---

### 4. Component: GL Interface Monitoring

- **Nama Sub Menu:** Interface Config
- **Link Sub Menu:** `/banking/parameters/journal/interface`
- **Database:** `Platform Admin`
- **Skema:** `platform_admin`
- **Nama Tabel:** `integration_config`
- **Deskripsi:** Konfigurasi teknis pengiriman jurnal ke Core Banking System (CBS).
- **Query:**
  ```sql
  SELECT
      config_key,
      config_value,
      description,
      last_updated_at
  FROM platform_admin.integration_config
  WHERE service_name = 'GL_INTERFACE'
  ORDER BY config_key;
  ```
