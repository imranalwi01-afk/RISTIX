# Analisis Detail Link Workflow Configuration

## URL: http://localhost:4231/banking/workflow/configuration?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi definisi workflow (Workflow Designer).

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Workflow Management (`/banking/workflow`)
- **Child:** Workflow Configuration (`/banking/workflow/configuration`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini digunakan oleh Administrator untuk merancang alur persetujuan (Approval Flow) untuk berbagai entitas bisnis dalam sistem IFRS 9.

Fungsi Utama:

1.  **Workflow Definition:** Mendaftarkan tipe workflow baru (misal: "Persetujuan Model PD", "Perubahan Segmentasi").
2.  **Step Design:** Menentukan urutan langkah (Step 1 -> Step 2 -> Step 3).
3.  **Role Assignment:** Menentukan role mana yang berwenang melakukan approval pada setiap step.
4.  **Conditional Logic:** Menambahkan aturan khusus (misal: Jika perubahan > 10%, butuh approval Direksi).

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Workflow Master List**

**Status: CORE CONFIGURATION**

- **Deskripsi:** Daftar definisi workflow yang tersedia dalam sistem.
- **Tabel Utama:** `workflow.workflows` (Database: Platform Admin)
- **Logika:** Menampilkan workflow aktif dan non-aktif.

**Query Pattern:**

```sql
SELECT id, workflow_code, workflow_name, description, is_active, version
FROM workflow.workflows
WHERE tenant_id = :tenant_id
ORDER BY workflow_name;
```

---

### ✅ **2. Widget: Step Sequencer (Visual Editor)**

**Status: LOGIC DEFINITION**

- **Deskripsi:** Editor untuk mengatur urutan approval.
- **Tabel Utama:** `workflow.workflow_steps`
- **Logika:** Setiap step memiliki `sequence_order` dan `required_role_id`.

**Query Pattern:**

```sql
SELECT
    step_id, step_name, sequence_order,
    required_role_id, sla_hours,
    is_final_step
FROM workflow.workflow_steps
WHERE workflow_id = :selected_workflow_id
ORDER BY sequence_order;
```

---

### ✅ **3. Widget: Approval Matrix / Conditions**

**Status: CONDITIONAL LOGIC**

- **Deskripsi:** Tabel matriks untuk kondisi approval dinamis (misal: berdasarkan limit amount).
- **Tabel Utama:** `approval.approval_matrices` (atau `workflow.workflow_conditions`)
- **Logika:** `IF criteria_value > threshold THEN require_step_X`.

**Query Pattern:**

```sql
SELECT
    matrix_id, condition_field, operator,
    threshold_value, required_level
FROM approval.approval_matrices
WHERE workflow_id = :selected_workflow_id;
```

---

### ✅ **4. Widget: Active Instances Check**

**Status: VALIDATION**

- **Deskripsi:** Pengecekan apakah workflow ini sedang digunakan oleh request yang berjalan.
- **Tabel Utama:** `workflow.approval_requests` (Running Instances)
- **Logika:** Mencegah pengeditan struktur workflow jika masih ada transaksi pending yang menggunakan versi lama.

**Query Pattern:**

```sql
SELECT COUNT(*)
FROM workflow.approval_requests
WHERE workflow_code = :workflow_code
  AND status = 'PENDING';
```

---

## 📊 RINGKASAN SKEMA DATABASE

Modul ini menggunakan schema `workflow` dan `approval` di database **Platform Admin**:

1.  `workflow.workflows`: Header definisi.
2.  `workflow.workflow_steps`: Detail langkah.
3.  `approval.approval_matrices`: Logika bisnis tambahan.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/workflow/configuration?mode=conventional` adalah fondasi _Governance_. Fleksibilitas sistem IFRS 9 dalam mengakomodasi perubahan struktur organisasi bank ditentukan di sini.
