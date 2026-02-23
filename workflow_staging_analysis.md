# Analisis Detail Link Workflow Staging

## URL: http://localhost:4231/banking/workflow/staging?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman manajemen persetujuan _Staging Override_ (Intervensi Manual Klasifikasi Risiko).

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Workflow Management (`/banking/workflow`)
- **Child:** Staging Override Workflow (`/banking/workflow/staging`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini digunakan oleh _Approver_ (Risk Manager) untuk meninjau pengajuan perubahan stage manual yang diajukan oleh analis.

Fungsi Utama:

1.  **Override Review:** Melihat daftar akun yang diajukan untuk pindah stage secara manual (misal: Stage 1 -> Stage 2 karena informasi negatif eksternal).
2.  **Impact Assessment:** Menganalisis dampak kenaikan CKPN (ECL) jika override disetujui.
3.  **Approval Decision:** Menyetujui atau menolak pengajuan override.
4.  **Validity Control:** Mengatur berapa lama override berlaku (misal: 3 bulan, atau sampai review berikutnya).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Pending Override Requests**

**Status: INBOX**

- **Deskripsi:** Daftar pengajuan override yang menunggu persetujuan.
- **Tabel Utama:** `public.frs9_stage_override` (Database: FRS9PRO) join dengan `workflow.approval_requests`.
- **Logika:** Menampilkan request dengan status 'PENDING_APPROVAL'.

**Query Pattern:**

```sql
SELECT
    o.id, o.request_date,
    o.account_number, m.customer_name,
    o.original_stage, o.proposed_stage,
    o.reason_code, u.full_name as requester
FROM public.frs9_stage_override o
JOIN public.frs9_master_account m ON o.account_number = m.account_number
LEFT JOIN core.users u ON o.created_by = u.id
WHERE o.status = 'PENDING_APPROVAL'
ORDER BY o.request_date DESC;
```

---

### ✅ **2. Widget: Account Risk Profile**

**Status: DETAIL VIEW**

- **Deskripsi:** Informasi detail akun yang akan di-override (DPD, Rating, Outstanding).
- **Tabel Utama:** `public.frs9_master_account`
- **Logika:** Memberikan konteks kepada approver apakah override ini wajar.

**Query Pattern:**

```sql
SELECT
    account_number, segment_code,
    outstanding_balance,
    dpd_days, rating_code,
    original_eir, remaining_tenor
FROM public.frs9_master_account
WHERE account_number = :selected_account_number
  AND prc_date = CURRENT_DATE;
```

---

### ✅ **3. Widget: ECL Impact Simulation**

**Status: ANALYTICS**

- **Deskripsi:** Estimasi perubahan nilai CKPN jika stage berubah.
- **Tabel Utama:** `public.frs9_imp_ca_ecl_simulation` (atau kalkulasi on-the-fly).
- **Logika:** Membandingkan `ECL_Stage_1` (Current) vs `ECL_Stage_2` (Proposed).

**Query Pattern:**

```sql
SELECT
    current_stage, proposed_stage,
    current_ecl_amount,
    estimated_new_ecl,
    (estimated_new_ecl - current_ecl_amount) as ecl_impact
FROM public.frs9_stage_override
WHERE id = :override_id;
```

---

### ✅ **4. Widget: Override History**

**Status: AUDIT TRAIL**

- **Deskripsi:** Riwayat override sebelumnya pada akun yang sama.
- **Tabel Utama:** `public.frs9_stage_override`
- **Logika:** Mencegah override berulang tanpa dasar yang kuat.

**Query Pattern:**

```sql
SELECT request_date, proposed_stage, status, approved_by, comments
FROM public.frs9_stage_override
WHERE account_number = :selected_account_number
  AND id != :current_id
ORDER BY request_date DESC;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Halaman ini menjembatani data risiko dan workflow:

1.  `frs9_stage_override`: Tabel transaksi utama override.
2.  `frs9_master_account`: Data referensi akun.
3.  `workflow.approval_requests`: Engine approval.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/workflow/staging?mode=conventional` adalah mekanisme kontrol kualitas (Quality Control). Override yang tidak terkontrol dapat membiaskan laporan risiko bank, sehingga setiap perubahan manual harus memiliki jejak audit dan persetujuan berjenjang di halaman ini.
