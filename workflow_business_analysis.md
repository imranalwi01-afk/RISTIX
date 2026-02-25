# Analisis Detail Link Business Workflow

## URL: http://localhost:4231/banking/workflow/business?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman pengelolaan Workflow Bisnis (Approval Inbox & History).

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Workflow Management (`/banking/workflow`)
- **Child:** Business Workflow / My Tasks (`/banking/workflow/business`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi sebagai **Inbox Persetujuan** bagi user dengan role _Approver_ (misal: Supervisor, Risk Manager). User melakukan review, approve, atau reject terhadap transaksi yang diajukan oleh _Maker_.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Pending Tasks (My Inbox)**

**Status: CORE TRANSACTION**

- **Deskripsi:** Daftar tugas yang menunggu persetujuan dari user yang sedang login.
- **Database:** `FRS9PRO` (Tenant Database)
- **Skema:** `workflow`
- **Tabel Utama:** `approval_requests`
- **Logika:** Filter berdasarkan `assigned_role` user atau `assigned_user_id`.

**Query Pattern:**

```sql
SELECT
    r.id, r.entity_type, r.entity_id,
    r.request_type, -- CREATE, UPDATE, DELETE
    r.requested_by, r.requested_at,
    r.status
FROM workflow.approval_requests r
WHERE r.status = 'PENDING'
  AND (r.assigned_user_id = :current_user_id OR r.assigned_role IN (:user_roles))
ORDER BY r.requested_at DESC;
```

---

### ✅ **2. Widget: Workflow History**

**Status: AUDIT TRAIL**

- **Deskripsi:** Riwayat persetujuan yang pernah diproses.
- **Database:** `FRS9PRO` (Tenant Database)
- **Skema:** `workflow`
- **Tabel Utama:** `workflow_transitions`
- **Logika:** Menampilkan log perubahan status (misal: PENDING -> APPROVED).

**Query Pattern:**

```sql
SELECT
    t.workflow_id, t.from_state, t.to_state,
    t.actor_id, t.action_date, t.comments
FROM workflow.workflow_transitions t
WHERE t.tenant_id = :current_tenant_id
ORDER BY t.action_date DESC;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Modul ini menggunakan database **FRS9PRO** (Tenant) untuk menjamin isolasi data persetujuan antar bank:

1.  **Schema `workflow` (FRS9PRO)**:
    - `approval_requests`: Header permintaan persetujuan.
    - `workflow_instances`: Instance proses yang sedang berjalan.
    - `workflow_transitions`: Log audit perubahan status.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/workflow/business` adalah halaman operasional harian.

Data workflow **TIDAK BOLEH** disimpan di `Platform Admin` karena berisi data transaksi sensitif (misal: ID Debitur, Nilai Limit) yang bersifat rahasia per tenant. Migrasi ke schema `workflow` di database `FRS9PRO` adalah implementasi yang benar sesuai prinsip _Database-per-tenant isolation_.
