# Analisis Detail Link Workflow Business

## URL: http://localhost:4231/banking/workflow/business?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi proses bisnis workflow (Business Process Mapping).

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Workflow Management (`/banking/workflow`)
- **Child:** Business Process (`/banking/workflow/business`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi sebagai jembatan antara _Business Requirement_ dan _Technical Workflow_. Di sini administrator menentukan workflow mana yang akan dipicu oleh kejadian bisnis tertentu, serta mengatur parameter SLA (Service Level Agreement).

Fungsi Utama:

1.  **Process Mapping:** Menghubungkan event bisnis (misal: "Pengajuan Kredit Komersial") dengan definisi workflow teknis.
2.  **SLA Configuration:** Menentukan target waktu penyelesaian (misal: 2 hari kerja).
3.  **Routing Rules:** Mengarahkan workflow berdasarkan kriteria bisnis (misal: Cabang A ke Regional X, Cabang B ke Regional Y).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Business Process Catalog**

**Status: MASTER DATA**

- **Deskripsi:** Daftar proses bisnis yang terdaftar dalam sistem yang memerlukan workflow.
- **Tabel Utama:** `workflow.business_processes` (Database: Platform Admin)
- **Logika:** Menampilkan daftar proses seperti "Credit Approval", "Limit Maintenance", "Write-off Request".

**Query Pattern:**

```sql
SELECT process_code, process_name, category, description
FROM workflow.business_processes
WHERE is_active = true
ORDER BY category, process_name;
```

---

### ✅ **2. Form: Workflow Mapping**

**Status: CONFIGURATION**

- **Deskripsi:** Memetakan proses bisnis ke definisi workflow spesifik.
- **Tabel Utama:** `workflow.process_mappings`
- **Logika:** `IF Process = 'CREDIT_APP' AND Product = 'KPR' THEN Use Workflow 'WF_KPR_V1'`.

**Query Pattern:**

```sql
SELECT
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
```

---

## 📊 RINGKASAN SKEMA DATABASE

Modul ini menggunakan schema `workflow` untuk konfigurasi bisnis:

1.  `workflow.business_processes`: Katalog proses.
2.  `workflow.process_mappings`: Logika routing.
3.  `workflow.sla_definitions`: Parameter waktu.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/workflow/business?mode=conventional` memungkinkan bank untuk menyesuaikan perilaku workflow tanpa mengubah kode program (Hardcoding). Misalnya, jika bank ingin memperketat SLA untuk produk tertentu, cukup ubah konfigurasi di halaman ini.
