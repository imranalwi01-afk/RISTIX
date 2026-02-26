<<<<<<< HEAD
# Analisis Detail Link Business Workflow

## URL: http://localhost:4231/banking/workflow/business?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman pengelolaan Workflow Bisnis (Approval Inbox & History).
=======
# Analisis Detail Link Workflow Business

## URL: http://localhost:4231/banking/workflow/business?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi proses bisnis workflow (Business Process Mapping).
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Workflow Management (`/banking/workflow`)
<<<<<<< HEAD
- **Child:** Business Workflow / My Tasks (`/banking/workflow/business`)
=======
- **Child:** Business Process (`/banking/workflow/business`)
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

<<<<<<< HEAD
Halaman ini berfungsi sebagai **Inbox Persetujuan** bagi user dengan role _Approver_ (misal: Supervisor, Risk Manager). User melakukan review, approve, atau reject terhadap transaksi yang diajukan oleh _Maker_.
=======
Halaman ini berfungsi sebagai jembatan antara _Business Requirement_ dan _Technical Workflow_. Di sini administrator menentukan workflow mana yang akan dipicu oleh kejadian bisnis tertentu, serta mengatur parameter SLA (Service Level Agreement).

Fungsi Utama:

1.  **Process Mapping:** Menghubungkan event bisnis (misal: "Pengajuan Kredit Komersial") dengan definisi workflow teknis.
2.  **SLA Configuration:** Menentukan target waktu penyelesaian (misal: 2 hari kerja).
3.  **Routing Rules:** Mengarahkan workflow berdasarkan kriteria bisnis (misal: Cabang A ke Regional X, Cabang B ke Regional Y).
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

<<<<<<< HEAD
### ✅ **1. Widget: Pending Tasks (My Inbox)**

**Status: CORE TRANSACTION**

- **Deskripsi:** Daftar tugas yang menunggu persetujuan dari user yang sedang login.
- **Database:** `FRS9PRO` (Tenant Database)
- **Skema:** `workflow`
- **Tabel Utama:** `approval_requests`
- **Logika:** Filter berdasarkan `assigned_role` user atau `assigned_user_id`.
=======
### ✅ **1. Widget: Business Process Catalog**

**Status: MASTER DATA**

- **Deskripsi:** Daftar proses bisnis yang terdaftar dalam sistem yang memerlukan workflow.
- **Tabel Utama:** `workflow.business_processes` (Database: Platform Admin)
- **Logika:** Menampilkan daftar proses seperti "Credit Approval", "Limit Maintenance", "Write-off Request".
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740

**Query Pattern:**

```sql
<<<<<<< HEAD
SELECT
    r.id, r.entity_type, r.entity_id,
    r.request_type, -- CREATE, UPDATE, DELETE
    r.requested_by, r.requested_at,
    r.status
FROM workflow.approval_requests r
WHERE r.status = 'PENDING'
  AND (r.assigned_user_id = :current_user_id OR r.assigned_role IN (:user_roles))
ORDER BY r.requested_at DESC;
=======
SELECT process_code, process_name, category, description
FROM workflow.business_processes
WHERE is_active = true
ORDER BY category, process_name;
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740
```

---

<<<<<<< HEAD
### ✅ **2. Widget: Workflow History**

**Status: AUDIT TRAIL**

- **Deskripsi:** Riwayat persetujuan yang pernah diproses.
- **Database:** `FRS9PRO` (Tenant Database)
- **Skema:** `workflow`
- **Tabel Utama:** `workflow_transitions`
- **Logika:** Menampilkan log perubahan status (misal: PENDING -> APPROVED).
=======
### ✅ **2. Form: Workflow Mapping**

**Status: CONFIGURATION**

- **Deskripsi:** Memetakan proses bisnis ke definisi workflow spesifik.
- **Tabel Utama:** `workflow.process_mappings`
- **Logika:** `IF Process = 'CREDIT_APP' AND Product = 'KPR' THEN Use Workflow 'WF_KPR_V1'`.
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740

**Query Pattern:**

```sql
SELECT
<<<<<<< HEAD
    t.workflow_id, t.from_state, t.to_state,
    t.actor_id, t.action_date, t.comments
FROM workflow.workflow_transitions t
WHERE t.tenant_id = :current_tenant_id
ORDER BY t.action_date DESC;
=======
    mapping_id, process_code,
    workflow_id,
    criteria_json -- e.g., {"product_type": "KPR", "amount_min": 500000000}
FROM workflow.process_mappings
WHERE tenant_id = :tenant_id;
```

---

### ✅ **3. Widget: SLA & Escalation**

**Status: PARAMETER**

- **Deskripsi:** Pengaturan batas waktu (Due Date) dan aksi jika terlambat (Eskalasi).
- **Tabel Utama:** `workflow.sla_definitions`
- **Logika:** Menghitung `Due Date` berdasarkan kalender kerja.

**Query Pattern:**

```sql
SELECT
    process_code, step_name,
    sla_duration_hours,
    escalation_email,
    auto_action -- e.g., NOTIFY_MANAGER, AUTO_REJECT
FROM workflow.sla_definitions
WHERE mapping_id = :selected_mapping_id;
```

---

### ✅ **4. Widget: Notification Templates**

**Status: COMMUNICATION**

- **Deskripsi:** Template email/notifikasi yang dikirim saat status workflow berubah.
- **Tabel Utama:** `workflow.notification_templates`
- **Logika:** Mengaitkan template dengan event workflow (OnCreate, OnApprove, OnReject).

**Query Pattern:**

```sql
SELECT event_type, template_subject, template_body
FROM workflow.notification_templates
WHERE process_code = :selected_process_code;
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740
```

---

## 📊 RINGKASAN SKEMA DATABASE

<<<<<<< HEAD
Modul ini menggunakan database **FRS9PRO** (Tenant) untuk menjamin isolasi data persetujuan antar bank:

1.  **Schema `workflow` (FRS9PRO)**:
    - `approval_requests`: Header permintaan persetujuan.
    - `workflow_instances`: Instance proses yang sedang berjalan.
    - `workflow_transitions`: Log audit perubahan status.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/workflow/business` adalah halaman operasional harian.

Data workflow **TIDAK BOLEH** disimpan di `Platform Admin` karena berisi data transaksi sensitif (misal: ID Debitur, Nilai Limit) yang bersifat rahasia per tenant. Migrasi ke schema `workflow` di database `FRS9PRO` adalah implementasi yang benar sesuai prinsip _Database-per-tenant isolation_.
=======
Modul ini menggunakan schema `workflow` untuk konfigurasi bisnis:

1.  `workflow.business_processes`: Katalog proses.
2.  `workflow.process_mappings`: Logika routing.
3.  `workflow.sla_definitions`: Parameter waktu.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/workflow/business?mode=conventional` memungkinkan bank untuk menyesuaikan perilaku workflow tanpa mengubah kode program (Hardcoding). Misalnya, jika bank ingin memperketat SLA untuk produk tertentu, cukup ubah konfigurasi di halaman ini.
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740
