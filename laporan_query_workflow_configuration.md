# Laporan Detail Query & Tabel Workflow Configuration

## Menu: Workflow Design & Setup

**URL:** `http://localhost:4231/banking/workflow/configuration?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen konfigurasi workflow.

---

### 1. Component: Workflow Definition List

- **Nama Sub Menu:** Workflow List
- **Link Sub Menu:** `/banking/workflow/configuration`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `workflows`
- **Deskripsi:** Daftar template workflow yang terdaftar.
- **Query:**
  ```sql
  SELECT
      id,
      workflow_code, -- e.g., WF_SEGMENTATION_CHANGE
      workflow_name,
      module_name,   -- e.g., COLLECTIVE_IMPAIRMENT
      is_active,
      created_at,
      updated_at
  FROM workflow.workflows
  WHERE tenant_id = :tenant_id
  ORDER BY module_name, workflow_name;
  ```

---

### 2. Component: Step Configuration

- **Nama Sub Menu:** Step Editor
- **Link Sub Menu:** `/banking/workflow/configuration/steps/{workflowId}`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `workflow_steps`
- **Deskripsi:** Mengambil urutan langkah approval dan role yang dibutuhkan.
- **Query:**
  ```sql
  SELECT
      ws.id,
      ws.step_name,
      ws.step_order,
      ws.role_id,
      r.name as role_name,
      ws.action_type, -- APPROVE, REVIEW, ACKNOWLEDGE
      ws.auto_approve_condition -- JSON logic for auto-approval
  FROM workflow.workflow_steps ws
  LEFT JOIN core.roles r ON ws.role_id = r.id
  WHERE ws.workflow_id = :workflow_id
  ORDER BY ws.step_order;
  ```

---

### 3. Component: Approval Matrix (Thresholds)

- **Nama Sub Menu:** Matrix Config
- **Link Sub Menu:** `/banking/workflow/configuration/matrix`
- **Database:** `Platform Admin`
- **Skema:** `approval`
- **Nama Tabel:** `approval_matrices`
- **Deskripsi:** Aturan limit otorisasi (misal: Manager max 1M, GM max 5M).
- **Query:**
  ```sql
  SELECT
      id,
      workflow_code,
      currency_code,
      min_amount,
      max_amount,
      required_approval_level
  FROM approval.approval_matrices
  WHERE workflow_code = :workflow_code
  ORDER BY min_amount;
  ```

---

### 4. Component: Usage Validation

- **Nama Sub Menu:** Dependency Check
- **Link Sub Menu:** `/banking/workflow/configuration`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `approval_requests`
- **Deskripsi:** Mengecek apakah aman untuk mengubah workflow (tidak ada pending request).
- **Query:**
  ```sql
  SELECT count(*) as pending_count
  FROM workflow.approval_requests
  WHERE workflow_id = :workflow_id
    AND status IN ('PENDING', 'IN_PROGRESS');
  ```
