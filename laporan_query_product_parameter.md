# Laporan Detail Query & Tabel Product Parameter

## Menu: Product Parameters

**URL:** `http://localhost:4231/banking/parameters/product?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen produk perbankan.

---

### 1. Component: Product Master List

- **Nama Sub Menu:** Product List
- **Link Sub Menu:** `/banking/parameters/product`
- **Database:** `Platform Admin` / `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `banking_products`
- **Deskripsi:** Menampilkan daftar produk yang tersedia untuk operasional bank.
- **Query:**
  ```sql
  SELECT
      id,
      product_code,
      product_name,
      product_group, -- LENDING / FUNDING
      product_type, -- KPR, KTA, TERM_LOAN
      currency_code,
      is_active
  FROM core.banking_products
  WHERE banking_type = 'conventional'
  ORDER BY product_group, product_code;
  ```

---

### 2. Component: Product Detail & Attributes

- **Nama Sub Menu:** Product Detail
- **Link Sub Menu:** `/banking/parameters/product/detail`
- **Database:** `Platform Admin` / `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `banking_products`
- **Deskripsi:** Atribut lengkap produk untuk keperluan kalkulasi bunga dan jadwal.
- **Query:**
  ```sql
  SELECT
      product_code,
      interest_rate_type, -- FIXED, FLOATING
      interest_calculation_method, -- FLAT, ANNUITY, EFFECTIVE
      days_in_year_basis, -- 360, 365, ACTUAL
      grace_period_allowed,
      penalty_rate
  FROM core.banking_products
  WHERE id = :product_id;
  ```

---

### 3. Component: Accounting (GL) Mapping

- **Nama Sub Menu:** GL Mapping
- **Link Sub Menu:** `/banking/parameters/product`
- **Database:** `Platform Admin` / `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `product_gl_mapping`
- **Deskripsi:** Relasi produk ke Chart of Accounts (CoA).
- **Query:**
  ```sql
  SELECT
      m.event_type, -- DISBURSEMENT, REPAYMENT_PRINCIPAL, REPAYMENT_INTEREST
      m.gl_account_code,
      c.account_name as gl_account_name,
      m.cr_dr_flag
  FROM core.product_gl_mapping m
  LEFT JOIN core.chart_of_accounts c ON m.gl_account_code = c.account_code
  WHERE m.product_code = :product_code;
  ```

---

### 4. Component: Associated Risk Segments

- **Nama Sub Menu:** Risk Segmentation
- **Link Sub Menu:** `/banking/parameters/product`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_segment_config`
- **Deskripsi:** Mengecek apakah produk ini sudah terdaftar dalam aturan segmentasi IFRS 9.
- **Query:**
  ```sql
  SELECT segment_name, segment_type, created_date
  FROM public.frs9_imp_ca_segment_config
  WHERE definition_query LIKE '%' || :product_code || '%'
     OR product_list_json::jsonb ? :product_code;
  ```

```

Analisis ini melengkapi dokumentasi modul **Parameter Management**, yang menghubungkan definisi produk operasional (`core`) dengan konfigurasi risiko (`public` di FRS9PRO).

<!--
[PROMPT_SUGGESTION]buatkan script SQL untuk membuat tabel core.banking_products dan core.product_gl_mapping beserta data dummynya[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]bagaimana cara memastikan konsistensi data antara kode produk di tabel master account dan tabel banking products?[/PROMPT_SUGGESTION]
-->
```
