# Laporan Detail Query & Tabel FL Scalar

## Menu: Forward Looking Adjustment

**URL:** `http://localhost:4231/banking/collective/fl-scalar?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen Forward Looking Information (FLI).

---

### 1. Component: Scenario Weights

- **Nama Sub Menu:** Scenario Configuration
- **Link Sub Menu:** `/banking/collective/fl-scalar`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_scenario_config`
- **Deskripsi:** Mengambil konfigurasi bobot probabilitas untuk skenario Best, Base, dan Worst.
- **Query:**
  ```sql
  SELECT
      id,
      scenario_code, -- BEST, BASE, WORST
      scenario_name,
      probability_weight, -- e.g., 0.30, 0.40, 0.30
      description,
      last_updated
  FROM public.frs9_imp_ca_scenario_config
  WHERE banking_type = 'conventional'
    AND is_active = true
  ORDER BY id;
  ```

---

### 2. Component: Macroeconomic Forecasts

- **Nama Sub Menu:** Forecast Data Input
- **Link Sub Menu:** `/banking/collective/fl-scalar/forecast`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_fli_forecast`
- **Deskripsi:** Data proyeksi variabel makroekonomi per tahun dan per skenario.
- **Query:**
  ```sql
  SELECT
      f.id,
      f.period_year,
      s.scenario_name,
      v.variable_name, -- GDP Growth, Inflation, BI Rate
      f.forecast_value
  FROM public.frs9_imp_ca_fli_forecast f
  JOIN public.frs9_imp_ca_scenario_config s ON f.scenario_id = s.id
  JOIN public.frs9_imp_ca_fli_variables v ON f.variable_id = v.id
  WHERE f.period_year BETWEEN DATE_PART('year', CURRENT_DATE) AND (DATE_PART('year', CURRENT_DATE) + 5)
  ORDER BY f.period_year, s.id, v.id;
  ```

---

### 3. Component: Scalar Values (Multipliers)

- **Nama Sub Menu:** Scalar Result
- **Link Sub Menu:** `/banking/collective/fl-scalar`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_fli_scalar`
- **Deskripsi:** Nilai pengali akhir yang akan diterapkan pada PD/LGD.
- **Query:**
  ```sql
  SELECT
      s.period_year,
      sc.scenario_name,
      s.scalar_pd,
      s.scalar_lgd
  FROM public.frs9_imp_ca_fli_scalar s
  JOIN public.frs9_imp_ca_scenario_config sc ON s.scenario_id = sc.id
  WHERE s.pd_config_id = :pd_config_id
  ORDER BY s.period_year, sc.id;
  ```

---

### 4. Component: Regression Model Info

- **Nama Sub Menu:** Model Reference
- **Link Sub Menu:** `/banking/collective/fl-scalar`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_pd_config`
- **Deskripsi:** Informasi model PD mana yang sedang dikonfigurasi scalarnya.
- **Query:**
  ```sql
  SELECT model_name, r_squared, created_date
  FROM public.frs9_imp_ca_pd_config
  WHERE id = :pd_config_id;
  ```
