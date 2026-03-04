# Laporan Detail Query & Tabel Workflow Approval

## Menu: Approval Inbox & History

**URL:** `http://localhost:4231/banking/workflow/approval?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen workflow approval.

---

### 1. Component: Pending Inbox

- **Nama Sub Menu:** My Tasks
- **Link Sub Menu:** `/banking/workflow/approval`
- **Database:** `Platform Admin` (atau Tenant DB dengan schema workflow)
- **Skema:** `workflow`
- **Nama Tabel:** `approval_requests`
- **Deskripsi:** Daftar item yang menunggu persetujuan user saat ini.
- **Query:**
  ```sql
  SELECT
      r.id as request_id,
      r.reference_number, -- e.g., "SEG-2026-001"
      r.entity_type,      -- e.g., "SEGMENTATION", "PD_MODEL"
      r.request_type,     -- CREATE, UPDATE, DELETE
      u.full_name as requested_by_name,
      r.created_at,
      r.status,
      r.priority
  FROM workflow.approval_requests r
  LEFT JOIN core.users u ON r.requested_by = u.id
  WHERE r.status = 'PENDING'
    AND r.tenant_id = :tenant_id
    -- Filter berdasarkan permission user
    AND (r.assigned_to_user = :user_id OR r.required_permission IN (:user_permissions))
  ORDER BY r.priority DESC, r.created_at ASC;
  ```

---

### 2. Component: Request Details (Payload)

- **Nama Sub Menu:** Review Changes
- **Link Sub Menu:** `/banking/workflow/approval/view/{requestId}`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `approval_requests`
- **Deskripsi:** Mengambil data JSON perubahan untuk ditampilkan di UI (Before vs After).
- **Query:**
  ```sql
  SELECT
      id,
      entity_type,
      entity_id,
      current_data_snapshot, -- JSON data lama
      new_data_payload,      -- JSON data baru yang diajukan
      request_reason,
      attachment_url
  FROM workflow.approval_requests
  WHERE id = :request_id;
  ```

---

### 3. Component: Approval History Log

- **Nama Sub Menu:** History / Audit Trail
- **Link Sub Menu:** `/banking/workflow/approval/history`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `approval_history`
- **Deskripsi:** Riwayat persetujuan yang pernah dilakukan user (Approved/Rejected).
- **Query:**
  ```sql
  SELECT
      h.id,
      r.reference_number,
      r.entity_type,
      h.action,       -- APPROVE, REJECT, REQUEST_CHANGE
      h.comments,
      h.action_date,
      r.request_type
  FROM workflow.approval_history h
  JOIN workflow.approval_requests r ON h.request_id = r.id
  WHERE h.actor_id = :user_id
  ORDER BY h.action_date DESC
  LIMIT 50;
  ```

---

### 4. Component: Workflow Definition (Metadata)

- **Nama Sub Menu:** Workflow Config (Hidden/System)
- **Link Sub Menu:** `/banking/workflow/approval`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `workflows`
- **Deskripsi:** Mengambil konfigurasi step approval (misal: butuh 2 level approval).
- **Query:**
  ```sql
  SELECT
      step_name,
      required_role,
      is_final_step,
      auto_approve_condition
  FROM workflow.workflow_steps
  WHERE workflow_code = :entity_type
  ORDER BY step_order;
  ```
