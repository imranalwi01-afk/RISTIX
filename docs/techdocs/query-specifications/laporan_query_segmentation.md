# Laporan Detail Query & Tabel Segmentation Rules

## Menu: Segmentation Configuration

**URL:** `http://localhost:4231/banking/collective/segmentation?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen aturan segmentasi IFRS 9.

---

### 1. Component: Segment Hierarchy List

- **Nama Sub Menu:** Segment List
- **Link Sub Menu:** `/banking/collective/segmentation`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_segment_config`
- **Deskripsi:** Menampilkan daftar segmen urut berdasarkan prioritas eksekusi.
- **Query:**
  ```sql
  SELECT
      id,
      segment_name,
      segment_code,
      segment_type, -- RETAIL, WHOLESALE, TREASURY
      priority,
      description,
      is_active,
      last_updated_date
  FROM public.frs9_imp_ca_segment_config
  WHERE banking_type = 'conventional'
  ORDER BY priority ASC;
  ```

---

### 2. Component: Rule Definition (Criteria)

- **Nama Sub Menu:** Rule Editor
- **Link Sub Menu:** `/banking/collective/segmentation/edit`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_segment_logic`
- **Deskripsi:** Mengambil detail parameter filter untuk satu segmen.
- **Query:**
  ```sql
  SELECT
      id,
      segment_id,
      field_name, -- e.g., product_code, customer_type
      operator,   -- e.g., EQUALS, IN, GREATER_THAN
      field_value,
      connector   -- AND, OR
  FROM public.frs9_imp_ca_segment_logic
  WHERE segment_id = :segment_id
  ORDER BY sequence_order;
  ```

---

### 3. Component: Segment Population Statistics

- **Nama Sub Menu:** Segment Statistics
- **Link Sub Menu:** `/banking/collective/segmentation`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Statistik jumlah akun yang saat ini terpetakan ke segmen tersebut (hasil run terakhir).
- **Query:**
  ```sql
  SELECT
      s.segment_name,
      COUNT(m.account_number) as total_accounts,
      SUM(m.outstanding_balance) as total_exposure
  FROM public.frs9_imp_ca_segment_config s
  LEFT JOIN public.frs9_master_account m ON s.segment_code = m.segment_code
  WHERE m.prc_date = CURRENT_DATE
    AND s.banking_type = 'conventional'
  GROUP BY s.segment_name
  ORDER BY total_exposure DESC;
  ```

---

### 4. Component: Unmapped Account Check

- **Nama Sub Menu:** Validation (Unmapped)
- **Link Sub Menu:** `/banking/collective/segmentation`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Validasi integritas untuk memastikan semua akun memiliki rumah (segmen).
- **Query:**
  ```sql
  SELECT count(*) as unmapped_count
  FROM public.frs9_master_account
  WHERE (segment_code IS NULL OR segment_code = '')
    AND prc_date = CURRENT_DATE
    AND banking_type = 'conventional';
  ```
