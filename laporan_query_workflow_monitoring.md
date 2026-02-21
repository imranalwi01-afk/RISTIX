# Laporan Detail Query & Tabel Workflow Monitoring

## Menu: Process Monitoring & SLA

**URL:** `http://localhost:4231/banking/workflow/monitoring?mode=conventional`

Berikut adalah rincian teknis query untuk dashboard monitoring workflow.

---

### 1. Component: Workflow Status Overview

- **Nama Sub Menu:** Health Dashboard
- **Link Sub Menu:** `/banking/workflow/monitoring`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `workflow_instances`
- **Deskripsi:** Statistik status workflow dalam periode tertentu.
- **Query:**
  ```sql
  SELECT
      status, -- IN_PROGRESS, COMPLETED, REJECTED, CANCELLED
      COUNT(*) as count,
      AVG(EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time))/3600) as avg_hours
  FROM workflow.workflow_instances
  WHERE tenant_id = :tenant_id
    AND start_time BETWEEN :start_date AND :end_date
  GROUP BY status;
  ```

---

### 2. Component: Running Processes

- **Nama Sub Menu:** Active Instances
- **Link Sub Menu:** `/banking/workflow/monitoring/active`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `workflow_instances`
- **Deskripsi:** Daftar workflow yang sedang berjalan beserta posisi langkahnya.
- **Query:**
  ```sql
  SELECT
      i.id as instance_id,
      w.workflow_name,
      i.business_key, -- e.g., Application No / Account No
      i.current_step_name,
      u.full_name as initiator,
      i.start_time,
      i.due_date,
      CASE
          WHEN NOW() > i.due_date THEN 'OVERDUE'
          WHEN NOW() > (i.due_date - INTERVAL '1 day') THEN 'WARNING'
          ELSE 'ON_TRACK'
      END as sla_status
  FROM workflow.workflow_instances i
  JOIN workflow.workflows w ON i.workflow_id = w.id
  LEFT JOIN core.users u ON i.initiated_by = u.id
  WHERE i.status = 'IN_PROGRESS'
    AND i.tenant_id = :tenant_id
  ORDER BY i.start_time ASC;
  ```

---

### 3. Component: Task Bottleneck Analysis

- **Nama Sub Menu:** Performance Heatmap
- **Link Sub Menu:** `/banking/workflow/monitoring/analytics`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `workflow_task_history`
- **Deskripsi:** Mengidentifikasi langkah approval mana yang memakan waktu paling lama.
- **Query:**
  ```sql
  SELECT
      w.workflow_name,
      t.step_name,
      COUNT(*) as total_executions,
      AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600) as avg_duration_hours,
      MAX(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600) as max_duration_hours
  FROM workflow.workflow_task_history t
  JOIN workflow.workflow_instances i ON t.instance_id = i.id
  JOIN workflow.workflows w ON i.workflow_id = w.id
  WHERE t.status = 'COMPLETED'
    AND t.created_at >= (CURRENT_DATE - INTERVAL '30 days')
  GROUP BY w.workflow_name, t.step_name
  ORDER BY avg_duration_hours DESC;
  ```

---

### 4. Component: User Workload

- **Nama Sub Menu:** Resource Utilization
- **Link Sub Menu:** `/banking/workflow/monitoring/resources`
- **Database:** `Platform Admin`
- **Skema:** `workflow`
- **Nama Tabel:** `approval_requests`
- **Deskripsi:** Beban kerja per user/role (jumlah task pending).
- **Query:**
  ```sql
  SELECT
      COALESCE(u.full_name, r.name) as assignee_name,
      COUNT(*) as pending_tasks,
      MIN(created_at) as oldest_task_date
  FROM workflow.approval_requests ar
  LEFT JOIN core.users u ON ar.assigned_to_user = u.id
  LEFT JOIN core.roles r ON ar.assigned_to_role = r.id
  WHERE ar.status = 'PENDING'
  GROUP BY u.full_name, r.name
  ORDER BY pending_tasks DESC;
  ```
