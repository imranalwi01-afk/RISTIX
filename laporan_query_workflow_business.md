# Laporan Detail Query & Tabel Workflow Business

## Menu: Business Process Configuration

**URL:** `http://localhost:4231/banking/workflow/business?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen konfigurasi proses bisnis workflow.

---

### 1. Component: Process Catalog

- **Nama Sub Menu:** Process List
- **Link Sub Menu:** `/banking/workflow/business`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `business_processes`
- **Deskripsi:** Daftar jenis proses bisnis yang didukung sistem.
- **Query:**
  ```sql
  SELECT
      id,
      process_code, -- e.g., BP_CREDIT_ORIGINATION
      process_name,
      module,       -- e.g., LENDING, TREASURY
      risk_level,   -- LOW, MEDIUM, HIGH
      is_active
  FROM workflow.business_processes
  WHERE tenant_id = :tenant_id
  ORDER BY module, process_name;
  ```

---

### 2. Component: Workflow Assignment

- **Nama Sub Menu:** Mapping Editor
- **Link Sub Menu:** `/banking/workflow/business/map`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `process_mappings`
- **Deskripsi:** Menentukan workflow mana yang dijalankan untuk kondisi tertentu.
- **Query:**
  ```sql
  SELECT
      pm.id,
      bp.process_name,
      w.workflow_name,
      pm.priority,
      pm.condition_rule -- JSON logic, e.g. {"amount": {">": 1000000}}
  FROM workflow.process_mappings pm
  JOIN workflow.business_processes bp ON pm.process_id = bp.id
  JOIN workflow.workflows w ON pm.workflow_id = w.id
  WHERE pm.is_active = true
  ORDER BY bp.process_name, pm.priority;
  ```

---

### 3. Component: SLA Configuration

- **Nama Sub Menu:** SLA Settings
- **Link Sub Menu:** `/banking/workflow/business/sla`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `sla_definitions`
- **Deskripsi:** Konfigurasi target waktu layanan per langkah atau per proses.
- **Query:**
  ```sql
  SELECT
      s.id,
      s.mapping_id,
      ws.step_name,
      s.duration_minutes,
      s.business_hours_only, -- TRUE/FALSE
      s.warning_threshold_minutes
  FROM workflow.sla_definitions s
  LEFT JOIN workflow.workflow_steps ws ON s.step_id = ws.id
  WHERE s.mapping_id = :mapping_id
  ORDER BY ws.step_order;
  ```

---

### 4. Component: Notification Rules

- **Nama Sub Menu:** Notifications
- **Link Sub Menu:** `/banking/workflow/business/notifications`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `notification_rules`
- **Deskripsi:** Aturan pengiriman email/notifikasi.
- **Query:**
  ```sql
  SELECT
      trigger_event, -- PROCESS_STARTED, STEP_COMPLETED, SLA_BREACHED
      recipient_type, -- INITIATOR, CURRENT_ASSIGNEE, MANAGER
      template_id,
      channel -- EMAIL, IN_APP, SMS
  FROM workflow.notification_rules
  WHERE mapping_id = :mapping_id;
  ```
