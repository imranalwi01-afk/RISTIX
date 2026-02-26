# Analisis Detail Workflow Business

## URL: http://localhost:4231/banking/workflow/business?mode=conventional

Dokumen ini merangkum dua kebutuhan yang sama-sama muncul di halaman Workflow Business:

1. **Approval Inbox & History** untuk operasional Maker/Checker/Approver.
2. **Business Process Mapping** untuk konfigurasi workflow oleh admin.

---

## 📋 Struktur Menu

- **Root:** Banking (`/banking`)
- **Parent:** Workflow Management (`/banking/workflow`)
- **Child:** Business Workflow (`/banking/workflow/business`)
- **Mode Filter:** `?mode=conventional`

---

## 🎯 Fungsi Halaman

Halaman ini idealnya dibagi menjadi 2 area/tab:

1. **My Tasks (Inbox):** menampilkan request pending yang perlu di-approve/reject oleh user sesuai role/routing.
2. **Workflow Setup (Admin):** memetakan event bisnis ke workflow, SLA, dan aturan routing.

Dengan pendekatan ini, operasional harian dan konfigurasi jangka panjang tetap berada di satu domain fitur, tapi tetap jelas per fungsi.

---

## 🔍 Analisis Komponen & Tabel

### 1. Pending Tasks / Approval Inbox

- **Status:** Core Transaction
- **Tujuan:** Menampilkan request yang menunggu aksi user login.
- **Database:** `FRS9PRO` (tenant DB)
- **Schema:** `workflow`
- **Tabel utama:** `approval_requests`, `approval_request_actions`

```sql
SELECT
  r.id,
  r.entity_type,
  r.entity_id,
  r.request_type,
  r.requested_by,
  r.requested_at,
  r.status
FROM workflow.approval_requests r
WHERE r.status = 'PENDING'
  AND (
    r.assigned_user_id = :current_user_id
    OR r.assigned_role IN (:user_roles)
  )
ORDER BY r.requested_at DESC;
```

### 2. Approval History / Transition Log

- **Status:** Audit Trail
- **Tujuan:** Melacak perubahan status approval end-to-end.
- **Database:** `FRS9PRO`
- **Schema:** `workflow`
- **Tabel utama:** `workflow_transitions`

```sql
SELECT
  t.workflow_id,
  t.from_state,
  t.to_state,
  t.actor_id,
  t.action_date,
  t.comments
FROM workflow.workflow_transitions t
WHERE t.tenant_id = :current_tenant_id
ORDER BY t.action_date DESC;
```

### 3. Business Process Mapping (Admin)

- **Status:** Configuration
- **Tujuan:** Mapping event bisnis ke workflow/routing yang aktif.
- **Database:** `FRS9PRO` (tenant-scoped config)
- **Schema:** `workflow`
- **Tabel utama:** `business_processes`, `process_mappings`

```sql
SELECT
  m.mapping_id,
  m.process_code,
  m.workflow_id,
  m.criteria_json
FROM workflow.process_mappings m
WHERE m.tenant_id = :tenant_id;
```

### 4. SLA & Escalation

- **Status:** Parameter
- **Tujuan:** Menetapkan due date, escalation action, dan auto action.
- **Database:** `FRS9PRO`
- **Schema:** `workflow`
- **Tabel utama:** `sla_definitions`

```sql
SELECT
  s.process_code,
  s.step_name,
  s.sla_duration_hours,
  s.escalation_email,
  s.auto_action
FROM workflow.sla_definitions s
WHERE s.mapping_id = :selected_mapping_id;
```

### 5. Notification Template

- **Status:** Communication
- **Tujuan:** Template notifikasi untuk event workflow.
- **Database:** `FRS9PRO`
- **Schema:** `workflow`
- **Tabel utama:** `notification_templates`

```sql
SELECT
  n.event_type,
  n.template_subject,
  n.template_body
FROM workflow.notification_templates n
WHERE n.process_code = :selected_process_code;
```

---

## 📊 Ringkasan Skema

Workflow business sebaiknya tetap **tenant-scoped** di database `FRS9PRO`:

1. `workflow.approval_requests`
2. `workflow.approval_request_actions`
3. `workflow.workflow_transitions`
4. `workflow.business_processes`
5. `workflow.process_mappings`
6. `workflow.sla_definitions`
7. `workflow.notification_templates`

---

## Kesimpulan

URL `/banking/workflow/business` sebaiknya menjadi **consolidated workflow hub** dengan tab operasional (Inbox/History) dan konfigurasi (Mapping/SLA/Template). Ini menjaga UX tetap sederhana tanpa memecah domain, sambil tetap memenuhi kebutuhan 4-eyes approval dan auditability.
