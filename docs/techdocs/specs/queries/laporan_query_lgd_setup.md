# Laporan Detail Query & Tabel LGD Setup

## Menu: Loss Given Default Configuration

**URL:** `http://localhost:4231/banking/collective/lgd-setup?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen model LGD.

---

### 1. Component: LGD Model List

- **Nama Sub Menu:** Model List
- **Link Sub Menu:** `/banking/collective/lgd-setup`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_lgd_config`
- **Deskripsi:** Daftar model LGD yang telah didefinisikan.
- **Query:**
  ```sql
  SELECT
      id,
      model_code,
      model_name,
      method, -- WORKOUT_LGD, MARKET_LGD, COLLATERAL_BASED
      is_active,
      last_updated_date,
      description
  FROM public.frs9_imp_ca_lgd_config
  WHERE banking_type = 'conventional'
  ORDER BY created_date DESC;
  ```

---

### 2. Component: Collateral & Recovery Parameters

- **Nama Sub Menu:** Parameter Input
- **Link Sub Menu:** `/banking/collective/lgd-setup/params`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_lgd_data`
- **Deskripsi:** Nilai haircut agunan atau recovery rate unsecured.
- **Query:**
  ```sql
  SELECT
      d.id,
      d.lgd_config_id,
      d.collateral_code, -- e.g., SHM, BPKB, DEPOSITO
      c.collateral_desc, -- Lookup ke tabel master collateral core
      d.haircut_percentage,
      d.forced_sale_value_ratio,
      d.recovery_rate_unsecured
  FROM public.frs9_imp_ca_lgd_data d
  LEFT JOIN core.collateral_types c ON d.collateral_code = c.code
  WHERE d.lgd_config_id = :lgd_config_id
  ORDER BY d.collateral_code;
  ```

---

### 3. Component: Historical Recovery Stats

- **Nama Sub Menu:** Recovery Analysis
- **Link Sub Menu:** `/banking/collective/lgd-setup/history`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_recovery_history`
- **Deskripsi:** Data historis pengembalian pinjaman macet.
- **Query:**
  ```sql
  SELECT
      vintage_year,
      segment_type,
      default_amount,
      recovered_amount_1yr,
      recovered_amount_2yr,
      recovered_amount_total,
      final_recovery_rate
  FROM public.frs9_imp_ca_recovery_history
  WHERE segment_type = :segment_type
  ORDER BY vintage_year DESC;
  ```

---

### 4. Component: Usage Mapping

- **Nama Sub Menu:** Segment Mapping
- **Link Sub Menu:** `/banking/collective/lgd-setup`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_segment_config`
- **Deskripsi:** Melihat segmen yang menggunakan model LGD ini.
- **Query:**
  ```sql
  SELECT segment_code, segment_name
  FROM public.frs9_imp_ca_segment_config
  WHERE lgd_config_id = :lgd_config_id;
  ```
