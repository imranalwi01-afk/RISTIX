# Analisis Detail Link Rule Base

## URL: http://localhost:4231/banking/collective/rule-base?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi aturan staging dan klasifikasi risiko (SICR).

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Collective Impairment (`/banking/collective`)
- **Child:** Rule Base / Staging Rules (`/banking/collective/rule-base`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi sebagai "Brain" dari klasifikasi risiko IFRS 9. Di sini user mendefinisikan kriteria **Significant Increase in Credit Risk (SICR)**.

Contoh Aturan:

1.  **Stage 1 ke Stage 2:** Jika DPD > 30 hari ATAU Rating turun 2 notch.
2.  **Stage 2 ke Stage 3:** Jika DPD > 90 hari (Default).
3.  **Cure Period:** Syarat akun untuk kembali membaik (misal: harus lancar selama 3 bulan berturut-turut).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Rule Set Master**

**Status: CORE CONFIGURATION**

- **Deskripsi:** Daftar paket aturan yang tersedia (misal: "Standard Retail Rules", "Corporate Rules 2025").
- **Tabel Utama:** `public.frs9_imp_ca_rule_config` (Database: FRS9PRO)
- **Logika:** Setiap segmen portofolio akan dikaitkan dengan satu Rule Set ini.

**Query Pattern:**

```sql
SELECT rule_id, rule_name, rule_type, version, is_active
FROM public.frs9_imp_ca_rule_config
WHERE banking_type = 'conventional'
ORDER BY created_date DESC;
```

---

### ✅ **2. Form: Logic Builder (SICR Criteria)**

**Status: LOGIC ENGINE**

- **Deskripsi:** Definisi kondisi teknis untuk perpindahan stage.
- **Tabel Utama:** `public.frs9_imp_ca_rule_logic`
- **Logika:** Menggunakan operator logika (AND/OR) terhadap parameter akun (DPD, Rating, Watchlist Flag).

**Query Pattern:**

```sql
SELECT
    logic_id, rule_id,
    target_stage, -- 1, 2, 3
    condition_field, -- e.g., dpd_days
    operator, -- >, <, =, BETWEEN
    threshold_value
FROM public.frs9_imp_ca_rule_logic
WHERE rule_id = :selected_rule_id
ORDER BY target_stage, sequence_no;
```

---

### ✅ **3. Widget: Segment Assignment**

**Status: MAPPING**

- **Deskripsi:** Menentukan segmen mana saja yang menggunakan aturan ini.
- **Tabel Utama:** `public.frs9_imp_ca_segment_config`
- **Logika:** Update kolom `rule_id` pada tabel konfigurasi segmen.

**Query Pattern:**

```sql
SELECT segment_name, segment_code
FROM public.frs9_imp_ca_segment_config
WHERE rule_id = :selected_rule_id;
```

---

### ✅ **4. Widget: Impact Simulation**

**Status: ANALYTICS**

- **Deskripsi:** Simulasi berapa banyak akun yang akan pindah stage jika aturan ini diterapkan.
- **Tabel Utama:** `public.frs9_master_account`
- **Logika:** Menjalankan query simulasi berdasarkan logika aturan baru terhadap data posisi terakhir.

**Query Pattern:**

```sql
-- Simulasi Stage 2
SELECT COUNT(*)
FROM public.frs9_master_account
WHERE prc_date = CURRENT_DATE
  AND dpd_days > 30; -- Kriteria dari Logic Builder
```

---

## 📊 RINGKASAN SKEMA DATABASE

Data aturan tersimpan di database **FRS9PRO** (Schema `public`):

1.  `frs9_imp_ca_rule_config`: Header aturan.
2.  `frs9_imp_ca_rule_logic`: Detail kondisi (WHERE clause generator).
3.  `frs9_imp_ca_segment_config`: Tabel relasi ke segmen.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/collective/rule-base?mode=conventional` adalah pusat kebijakan risiko. Perubahan di sini berdampak langsung pada nilai CKPN (ECL) karena perpindahan Stage 1 (12-month ECL) ke Stage 2 (Lifetime ECL) biasanya melipatgandakan nilai cadangan kerugian.
