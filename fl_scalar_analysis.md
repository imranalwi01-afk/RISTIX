# Analisis Detail Link FL Scalar

## URL: http://localhost:4231/banking/collective/fl-scalar?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi _Forward Looking Information (FLI) Scalar_.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Collective Impairment (`/banking/collective`)
- **Child:** FL Scalar / Macroeconomic Adjustment (`/banking/collective/fl-scalar`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini digunakan untuk menghitung atau menginput **Scalar Factors** (Multipliers) berdasarkan skenario ekonomi.

Konsep Utama:

1.  **Scenarios:** Biasanya terdiri dari 3 skenario: _Optimistic (Best)_, _Baseline (Base)_, dan _Pessimistic (Worst)_.
2.  **Probability Weights:** Bobot probabilitas untuk setiap skenario (misal: 30%, 40%, 30%).
3.  **Scalar:** Angka pengali yang dihasilkan dari model regresi makroekonomi. Jika ekonomi memburuk, scalar > 1 (meningkatkan PD).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Scenario Configuration**

**Status: CORE PARAMETER**

- **Deskripsi:** Menentukan bobot probabilitas untuk setiap skenario ekonomi.
- **Tabel Utama:** `public.frs9_imp_ca_scenario_config` (Database: FRS9PRO)
- **Logika:** Total bobot harus 100%.

**Query Pattern:**

```sql
SELECT scenario_id, scenario_name, probability_weight, is_active
FROM public.frs9_imp_ca_scenario_config
WHERE banking_type = 'conventional'
ORDER BY scenario_id;
```

---

### ✅ **2. Widget: Macroeconomic Forecast Data**

**Status: DATA INPUT**

- **Deskripsi:** Input data proyeksi indikator makro (GDP, Inflasi, Kurs) untuk 3-5 tahun ke depan.
- **Tabel Utama:** `public.frs9_imp_ca_fli_forecast`
- **Logika:** Data ini digunakan sebagai input rumus regresi untuk menghasilkan scalar.

**Query Pattern:**

```sql
SELECT
    f.period_year, f.scenario_id,
    v.variable_name, f.forecast_value
FROM public.frs9_imp_ca_fli_forecast f
JOIN public.frs9_imp_ca_fli_variables v ON f.variable_id = v.id
WHERE f.period_year >= DATE_PART('year', CURRENT_DATE)
ORDER BY f.period_year, f.scenario_id;
```

---

### ✅ **3. Widget: Scalar Calculation Results**

**Status: CALCULATION ENGINE**

- **Deskripsi:** Hasil perhitungan scalar per tahun untuk setiap skenario.
- **Tabel Utama:** `public.frs9_imp_ca_fli_scalar`
- **Logika:** `Scalar = Intercept + (Coeff1 * Var1) + (Coeff2 * Var2) ...`

**Query Pattern:**

```sql
SELECT
    s.period_year,
    sc.scenario_name,
    s.scalar_value_pd, -- Pengali untuk PD
    s.scalar_value_lgd -- Pengali untuk LGD (opsional)
FROM public.frs9_imp_ca_fli_scalar s
JOIN public.frs9_imp_ca_scenario_config sc ON s.scenario_id = sc.id
WHERE s.pd_config_id = :selected_model_id
ORDER BY s.period_year, sc.id;
```

---

### ✅ **4. Widget: Final Weighted Scalar**

**Status: ANALYTICS**

- **Deskripsi:** Rata-rata tertimbang dari scalar (Weighted Average) yang akan diaplikasikan ke ECL.
- **Tabel Utama:** `public.frs9_imp_ca_fli_scalar` (Aggregated)
- **Logika:** `Final Scalar = (ScalarBest * WeightBest) + (ScalarBase * WeightBase) + (ScalarWorst * WeightWorst)`

**Query Pattern:**

```sql
-- Biasanya dikalkulasi di backend atau view
SELECT period_year, weighted_scalar_pd
FROM public.frs9_imp_ca_fli_scalar_summary
WHERE pd_config_id = :selected_model_id;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Data FLI tersimpan di database **FRS9PRO** (Schema `public`):

1.  `frs9_imp_ca_scenario_config`: Definisi skenario & bobot.
2.  `frs9_imp_ca_fli_forecast`: Data mentah proyeksi ekonomi.
3.  `frs9_imp_ca_fli_scalar`: Hasil output multiplier.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/collective/fl-scalar?mode=conventional` menghubungkan ilmu ekonomi makro dengan akuntansi. Tanpa modul ini, ECL hanya bersifat _Point-in-Time_ (kondisi saat ini) dan tidak memenuhi syarat IFRS 9 yang mewajibkan _Forward Looking_.
