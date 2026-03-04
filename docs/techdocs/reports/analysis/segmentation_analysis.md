# Analisis Detail Link Segmentation Rules

## URL: http://localhost:4231/banking/collective/segmentation?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi aturan segmentasi portofolio.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Collective Impairment (`/banking/collective`)
- **Child:** Segmentation Rules (`/banking/collective/segmentation`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi untuk mendefinisikan logika pengelompokan akun (Grouping). Dalam IFRS 9, akun dengan karakteristik risiko serupa harus dikelompokkan bersama.

Contoh Segmentasi:

1.  **Product Type:** KPR, KTA, Kartu Kredit.
2.  **Customer Type:** Retail, Corporate, SME.
3.  **Collateral:** Secured vs Unsecured.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Segment Master List**

**Status: CORE CONFIGURATION**

- **Deskripsi:** Daftar segmen yang aktif beserta prioritas penerapannya.
- **Tabel Utama:** `public.frs9_imp_ca_segment_config` (Database: FRS9PRO)
- **Logika:** Segmen dievaluasi berdasarkan urutan prioritas (`priority`). Akun yang masuk ke segmen prioritas 1 tidak akan dicek di segmen prioritas 2.

**Query Pattern:**

```sql
SELECT segment_id, segment_name, segment_type, priority, is_active
FROM public.frs9_imp_ca_segment_config
WHERE banking_type = 'conventional'
ORDER BY priority ASC;
```

---

### ✅ **2. Form: Rule Builder (Criteria Editor)**

**Status: LOGIC ENGINE**

- **Deskripsi:** Editor visual atau SQL untuk menentukan kriteria segmen.
- **Tabel Utama:** `public.frs9_imp_ca_segment_logic` (atau kolom JSONB di tabel config).
- **Logika:** Menyimpan aturan seperti `product_code IN ('KPR01') AND customer_type = 'R'`.

**Query Pattern:**

```sql
SELECT
    logic_id, segment_id,
    attribute_name, operator, value_criteria,
    logical_operator -- AND/OR
FROM public.frs9_imp_ca_segment_logic
WHERE segment_id = :selected_segment_id
ORDER BY sequence_no;
```

---

### ✅ **3. Widget: Population Preview (Impact Analysis)**

**Status: ANALYTICS**

- **Deskripsi:** Menghitung estimasi jumlah akun yang akan masuk ke segmen ini berdasarkan data posisi terakhir.
- **Tabel Utama:** `public.frs9_master_account`
- **Logika:** Menjalankan query dinamis (Dynamic SQL) yang dibentuk dari Rule Builder terhadap tabel master account.

**Query Pattern:**

```sql
-- Contoh Dynamic Query yang digenerate sistem
SELECT COUNT(*) as estimated_population, SUM(outstanding_balance) as total_exposure
FROM public.frs9_master_account
WHERE prc_date = CURRENT_DATE
  AND (product_code = 'KPR' AND dpd_days < 90); -- Kriteria dari Rule Builder
```

---

### ✅ **4. Widget: Unmapped Accounts Monitor**

**Status: VALIDATION**

- **Deskripsi:** Memantau akun yang tidak masuk ke segmen manapun (Unclassified).
- **Tabel Utama:** `public.frs9_master_account`
- **Logika:** Akun yang `segment_id` nya NULL setelah proses klasifikasi.

**Query Pattern:**

```sql
SELECT COUNT(*)
FROM public.frs9_master_account
WHERE segment_id IS NULL
  AND prc_date = CURRENT_DATE;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Halaman ini berinteraksi penuh dengan database **FRS9PRO** (Schema `public`):

1.  **Schema `public`**:
    - `frs9_imp_ca_segment_config`: Header definisi segmen.
    - `frs9_imp_ca_segment_logic`: Detail aturan (WHERE clause).
    - `frs9_master_account`: Target data untuk simulasi.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/collective/segmentation?mode=conventional` adalah "Gatekeeper" kualitas model.
Jika aturan di sini salah (misal: tumpang tindih antar segmen), maka perhitungan PD/LGD akan bias karena data historis tercampur.
