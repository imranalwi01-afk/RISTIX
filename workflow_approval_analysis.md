# Analisis Detail Link Workflow Approval

## URL: http://localhost:4231/banking/workflow/approval?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman manajemen persetujuan (Approval Inbox).

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Workflow Management (`/banking/workflow`)
- **Child:** Approval Inbox (`/banking/workflow/approval`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini adalah pusat kendali _Maker-Checker_. Setiap perubahan pada parameter kritis (seperti Segmentasi, Model PD, atau Limit Kredit) tidak langsung aktif, melainkan masuk ke antrean ini sebagai _Pending Request_.

Fungsi Utama:

1.  **Inbox Review:** Melihat daftar tugas yang menunggu persetujuan.
2.  **Change Verification:** Membandingkan data lama vs data baru (_Before/After Snapshot_).
3.  **Decision Making:** Memberikan keputusan _Approve_ (Commit data) atau _Reject_ (Batalkan perubahan).
4.  **Audit Trail:** Melacak siapa yang meminta dan siapa yang menyetujui.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: My Pending Tasks (Inbox)**

**Status: ACTION REQUIRED**

- **Deskripsi:** Daftar request yang ditugaskan kepada user yang sedang login (atau role-nya).
- **Tabel Utama:** `workflow.approval_requests` (Database: Platform Admin / Tenant)
- **Logika:** Filter berdasarkan `status = 'PENDING'` dan `assigned_role` yang sesuai dengan user.

**Query Pattern:**

```sql
SELECT request_id, entity_type, request_type, requested_by, created_at
FROM workflow.approval_requests
WHERE status = 'PENDING'
  AND (assigned_user_id = :user_id OR assigned_role_id IN (:user_roles))
ORDER BY created_at DESC;
```

---

### ✅ **2. Widget: Request Detail (Diff View)**

**Status: VERIFICATION**

- **Deskripsi:** Menampilkan detail perubahan data. Biasanya dalam format JSON Diff atau Side-by-Side comparison.
- **Tabel Utama:** `workflow.approval_requests` (Kolom `payload` / `previous_state`).
- **Logika:** Memparsing JSON payload untuk menampilkan apa yang berubah.

**Query Pattern:**

```sql
SELECT
    entity_id,
    payload_json as new_data,
    previous_state_json as old_data,
    comments
FROM workflow.approval_requests
WHERE request_id = :selected_request_id;
```

---

### ✅ **3. Widget: Approval History (Log)**

**Status: AUDIT**

- **Deskripsi:** Riwayat persetujuan yang sudah selesai (Approved/Rejected).
- **Tabel Utama:** `workflow.approval_history`
- **Logika:** Menampilkan jejak audit keputusan sebelumnya.

**Query Pattern:**

```sql
SELECT
    action_date,
    actor_name,
    action_type, -- APPROVE, REJECT
    comments
FROM workflow.approval_history
WHERE request_id = :selected_request_id
ORDER BY action_date DESC;
```

---

### ✅ **4. Form: Decision Action**

**Status: TRANSACTION**

- **Deskripsi:** Form untuk submit keputusan beserta komentar wajib.
- **Tabel Utama:** `workflow.approval_requests` (Update Status) & `workflow.approval_history` (Insert Log).
- **Logika:** Jika Approve, sistem akan mengeksekusi perubahan ke tabel target (misal: update tabel `frs9_imp_ca_segment_config`).

**Query Pattern:**

```sql
-- Transactional Update
UPDATE workflow.approval_requests
SET status = 'APPROVED', approved_by = :user, approved_at = NOW()
WHERE request_id = :id;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Modul ini menggunakan schema `workflow` yang terpusat:

1.  `approval_requests`: Header transaksi approval.
2.  `approval_history`: Detail log aksi.
3.  `workflows`: Definisi alur (berapa level approval, siapa approvernya).

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/workflow/approval?mode=conventional` adalah gerbang keamanan integritas data. Tanpa persetujuan di sini, perubahan konfigurasi risiko tidak akan berlaku efektif di sistem kalkulasi.
