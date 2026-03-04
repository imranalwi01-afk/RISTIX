# Analisis Detail Link Journal Parameter

## URL: http://localhost:4231/banking/parameters/journal?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi parameter jurnal akuntansi.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Parameter Management (`/banking/parameters`)
- **Child:** Journal Parameters (`/banking/parameters/journal`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini mengatur "Accounting Engine" aplikasi. Dalam konteks IFRS 9, sistem perlu menghasilkan jurnal otomatis (Auto-Journal) untuk kejadian-kejadian berikut:

1.  **Provisioning (CKPN):** Pembentukan biaya cadangan kerugian (Expense vs Allowance).
2.  **Unwinding Interest:** Pengakuan pendapatan bunga dari aset _Impaired_ (Stage 3).
3.  **Write-Off:** Penghapusbukuan aset.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Chart of Accounts (CoA)**

**Status: MASTER DATA**

- **Deskripsi:** Daftar akun buku besar (GL) yang terdaftar dalam sistem.
- **Tabel Utama:** `core.chart_of_accounts`
- **Logika:** Menampilkan akun yang relevan untuk impairment (Biaya & Cadangan).

**Query Pattern:**

```sql
SELECT account_code, account_name, account_type, currency_code
FROM core.chart_of_accounts
WHERE is_active = true
ORDER BY account_code;
```

---

### ✅ **2. Widget: Journal Event Configuration**

**Status: CORE LOGIC**

- **Deskripsi:** Definisi kejadian bisnis (Business Events) yang memicu jurnal.
- **Tabel Utama:** `core.journal_events`
- **Logika:** Mengambil daftar event seperti `ECL_MONTHLY_PROVISION`, `ECL_REVERSAL`.

**Query Pattern:**

```sql
SELECT event_code, event_name, description, transaction_type
FROM core.journal_events
WHERE module = 'IFRS9'
ORDER BY event_code;
```

---

### ✅ **3. Form: Journal Template (Dr/Cr Mapping)**

**Status: CRITICAL CONFIGURATION**

- **Deskripsi:** Aturan pasangan jurnal (Debit/Kredit) untuk setiap event.
- **Tabel Utama:** `core.journal_templates`
- **Logika:** Menentukan akun mana yang di-Debit dan di-Kredit berdasarkan segmen atau produk.

**Query Pattern:**

```sql
SELECT
    t.template_code, t.event_code,
    t.dr_gl_account, t.cr_gl_account,
    t.segment_criteria
FROM core.journal_templates t
WHERE t.banking_type = 'conventional';
```

---

### ✅ **4. Widget: Interface Monitoring**

**Status: INTEGRATION**

- **Deskripsi:** Status koneksi atau format file untuk interface ke Core Banking System.
- **Tabel Utama:** `platform_admin.integration_config`
- **Logika:** Konfigurasi teknis pengiriman jurnal (API/File/Table).

**Query Pattern:**

```sql
SELECT config_key, config_value
FROM platform_admin.integration_config
WHERE service_name = 'GL_INTERFACE';
```

---

## 📊 RINGKASAN SKEMA DATABASE

Halaman ini berfokus pada schema `core` untuk definisi akuntansi:

1.  **Schema `core`** (Database: Platform/FRS9PRO):
    - `chart_of_accounts`: Master GL.
    - `journal_events`: Master Event.
    - `journal_templates`: Logika penjurnalan.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/parameters/journal?mode=conventional` adalah otak akuntansi aplikasi.

Kesalahan konfigurasi di sini (misal: terbalik Debit/Kredit pada `ECL_PROVISION`) akan menyebabkan laporan keuangan bank menjadi tidak valid. Validasi "Balance Check" (Total Dr = Total Cr) sangat krusial di modul ini.

````
# Analisis Detail Link PD Setup
## URL: http://localhost:4231/banking/collective/pd-setup?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi model *Probability of Default (PD)*.

---

## 📋 STRUKTUR MENU

### **Menu Path:**
- **Root:** Banking (`/banking`)
- **Parent:** Collective Impairment (`/banking/collective`)
- **Child:** PD Setup (`/banking/collective/pd-setup`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**
Halaman ini berfungsi untuk mengelola model matematika yang digunakan untuk memprediksi kemungkinan gagal bayar debitur.

Komponen Utama PD IFRS 9:
1.  **Transition Matrix:** Matriks perpindahan bucket (Roll Rate) historis.
2.  **TTC to PIT:** Konversi *Through-The-Cycle* (rata-rata jangka panjang) ke *Point-In-Time* (kondisi saat ini).
3.  **FLI Overlay:** Penyesuaian berdasarkan *Forward Looking Information* (Makroekonomi).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: PD Model Master**
**Status: CORE CONFIGURATION**

*   **Deskripsi:** Daftar model PD yang tersedia (misal: "Retail KPR Model v2025").
*   **Tabel Utama:** `public.frs9_imp_ca_pd_config` (Database: FRS9PRO)
*   **Logika:** Model aktif yang sesuai dengan `banking_type`.

**Query Pattern:**
```sql
SELECT config_id, model_name, method, period_start, period_end, status
FROM public.frs9_imp_ca_pd_config
WHERE banking_type = 'conventional'
ORDER BY created_date DESC;
````

---

### ✅ **2. Widget: Transition Matrix Input**

**Status: DATA INPUT**

- **Deskripsi:** Input atau view matriks transisi (migrasi antar bucket DPD).
- **Tabel Utama:** `public.frs9_imp_ca_pd_matrix`
- **Logika:** Menampilkan probabilitas perpindahan dari Bucket A ke Bucket B dalam periode 12 bulan.

**Query Pattern:**

```sql
SELECT
    from_bucket_id, to_bucket_id,
    migration_rate, observation_period
FROM public.frs9_imp_ca_pd_matrix
WHERE config_id = :selected_config_id
ORDER BY from_bucket_id, to_bucket_id;
```

---

### ✅ **3. Widget: Macroeconomic (FLI) Association**

**Status: MODELING**

- **Deskripsi:** Menghubungkan model PD dengan variabel makroekonomi (GDP, Inflasi) untuk penyesuaian _Forward Looking_.
- **Tabel Utama:** `public.frs9_imp_ca_fli_config`
- **Logika:** Model regresi yang menghubungkan Default Rate dengan variabel makro.

**Query Pattern:**

```sql
SELECT variable_name, coefficient, lag_period, r_squared
FROM public.frs9_imp_ca_pd_fli_regression
WHERE pd_config_id = :selected_config_id;
```

---

### ✅ **4. Widget: Segment Mapping**

**Status: ASSOCIATION**

- **Deskripsi:** Menentukan segmen mana yang menggunakan model PD ini.
- **Tabel Utama:** `public.frs9_imp_ca_segment_config`
- **Logika:** Update kolom `pd_config_id` pada tabel segmen.

**Query Pattern:**

```sql
SELECT segment_name, segment_type
FROM public.frs9_imp_ca_segment_config
WHERE pd_config_id = :selected_config_id;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Data model PD tersimpan di database **FRS9PRO** (Schema `public`):

1.  `frs9_imp_ca_pd_config`: Header model.
2.  `frs9_imp_ca_pd_matrix`: Data matriks transisi.
3.  `frs9_imp_ca_pd_fli_regression`: Koefisien regresi makroekonomi.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/collective/pd-setup?mode=conventional` adalah halaman paling teknis (quantitative) di modul ini.

Kualitas output ECL sangat bergantung pada:

1.  **Data Historis:** Kelengkapan data matriks transisi.
2.  **Korelasi Makro:** Seberapa kuat hubungan antara kondisi ekonomi dengan tingkat gagal bayar (R-Squared).

````

### 2. Laporan Query Spesifik Journal Parameter

```diff
````
