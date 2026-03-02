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

### 2. Laporan Query Spesifik Journal Parameter

```diff
````
