# Analisis Detail Link Individual Assessment

## URL: http://localhost:4231/banking/individual/assessment?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman pengelolaan _Individual Assessment (IA)_.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Individual Impairment (`/banking/individual`)
- **Child:** Assessment Report / List (`/banking/individual/assessment`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi sebagai _Workspace_ bagi Credit Analyst untuk melakukan perhitungan ECL secara spesifik per debitur.

Metode yang didukung biasanya:

1.  **Discounted Cash Flow (DCF):** Memproyeksikan arus kas masa depan (dari operasional atau penjualan agunan) dan mendiskontokannya ke nilai kini (Present Value).
2.  **Collateral Based:** Berbasis nilai likuidasi agunan.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Assessment List (Inbox)**

**Status: CORE TRANSACTION**

- **Deskripsi:** Daftar penilaian yang sedang berjalan atau sudah selesai.
- **Tabel Utama:** `public.frs9_imp_ia_header` (Database: FRS9PRO)
- **Logika:** Menampilkan data header penilaian yang digabungkan dengan informasi nasabah.

**Query Pattern:**

```sql
SELECT
    h.ia_id, h.assessment_date,
    m.customer_name, m.account_number,
    h.stage, h.method, h.status, -- DRAFT, SUBMITTED, APPROVED
    h.final_ecl_amount
FROM public.frs9_imp_ia_header h
JOIN public.frs9_master_account m ON h.account_number = m.account_number
WHERE m.banking_type = 'conventional'
ORDER BY h.assessment_date DESC;
```

---

### ✅ **2. Form: Create New Assessment (Search Account)**

**Status: INITIATION**

- **Deskripsi:** Pencarian akun yang _eligible_ untuk dinilai secara individual (biasanya akun Signifikan atau Watchlist).
- **Tabel Utama:** `public.frs9_master_account`
- **Logika:** Filter akun yang belum memiliki _Active Assessment_ pada periode yang sama.

**Query Pattern:**

```sql
SELECT account_number, customer_name, outstanding_balance, rating_code
FROM public.frs9_master_account
WHERE banking_type = 'conventional'
  AND outstanding_balance > :significance_threshold
  AND account_number NOT IN (SELECT account_number FROM public.frs9_imp_ia_header WHERE status = 'OPEN');
```

---

### ✅ **3. Widget: Assessment Summary (Header Info)**

**Status: DETAIL VIEW**

- **Deskripsi:** Informasi ringkas mengenai parameter penilaian yang dipilih (EIR, Tanggal Posisi).
- **Tabel Utama:** `public.frs9_imp_ia_header`
- **Logika:** Mengambil data kunci untuk perhitungan DCF.

**Query Pattern:**

```sql
SELECT
    effective_interest_rate,
    currency_code,
    exchange_rate,
    scenario_probability_best,
    scenario_probability_base,
    scenario_probability_worst
FROM public.frs9_imp_ia_header
WHERE ia_id = :selected_ia_id;
```

---

### ✅ **4. Widget: Approval Workflow Status**

**Status: GOVERNANCE**

- **Deskripsi:** Melacak status persetujuan penilaian (Maker-Checker).
- **Tabel Utama:** `approval.approval_history` (Database: Platform)
- **Logika:** Menampilkan siapa yang membuat, mereview, dan menyetujui.

**Query Pattern:**

```sql
SELECT action_by, action_date, action_type, comments
FROM approval.approval_history
WHERE reference_id = :selected_ia_id
ORDER BY action_date;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Modul ini menggunakan database **FRS9PRO** untuk data transaksi dan **Platform** untuk workflow:

1.  **Schema `public` (FRS9PRO)**:
    - `frs9_imp_ia_header`: Tabel transaksi utama IA.
    - `frs9_master_account`: Data referensi akun.
2.  **Schema `approval` (Platform)**:
    - `approval_history`: Audit trail persetujuan.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/individual/assessment?mode=conventional` adalah halaman kerja utama analis kredit.
Berbeda dengan modul kolektif yang otomatis, modul ini sangat manual dan membutuhkan _Expert Judgment_. Integritas data antara `header` penilaian dan `master_account` sangat krusial.
