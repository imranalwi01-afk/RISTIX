# Analisis Detail Link Workflow Monitoring

## URL: http://localhost:4231/banking/workflow/monitoring?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman monitoring operasional workflow.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Workflow Management (`/banking/workflow`)
- **Child:** Workflow Monitoring (`/banking/workflow/monitoring`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi sebagai **Control Tower** untuk memantau kesehatan seluruh proses bisnis yang berjalan. Berbeda dengan _Approval Inbox_ yang bersifat personal, halaman ini memberikan pandangan global bagi Administrator atau Process Owner.

Fungsi Utama:

1.  **Process Visibility:** Melihat status seluruh workflow yang sedang berjalan (Running Instances).
2.  **SLA Tracking:** Mendeteksi proses yang terlambat (Overdue) atau mendekati tenggat waktu.
3.  **Bottleneck Detection:** Mengidentifikasi langkah mana yang paling sering macet.
4.  **Intervention:** Admin dapat melakukan _Force Approve_, _Reassign_, atau _Cancel_ pada workflow yang macet.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Workflow Health KPIs**

**Status: DASHBOARD**

- **Deskripsi:** Statistik ringkas jumlah workflow berdasarkan status (Active, Completed, Rejected, Terminated).
- **Tabel Utama:** `workflow.workflow_instances` (Database: Platform Admin)
- **Logika:** Aggregasi count group by status.

**Query Pattern:**

```sql
SELECT status, count(*) as total_count
FROM workflow.workflow_instances
WHERE tenant_id = :tenant_id
  AND start_time >= :start_date
GROUP BY status;
```

---

### ✅ **2. Widget: Active Instances Monitor**

**Status: REAL-TIME LIST**

- **Deskripsi:** Daftar detail workflow yang sedang aktif.
- **Tabel Utama:** `workflow.workflow_instances` & `workflow.workflows`.
- **Logika:** Menampilkan siapa yang sedang memegang "bola" (Current Step & Assignee).

**Query Pattern:**

```sql
SELECT
    i.instance_id, w.workflow_name,
    i.reference_id, i.current_step_name,
    i.started_by, i.start_time,
    i.due_date
FROM workflow.workflow_instances i
JOIN workflow.workflows w ON i.workflow_id = w.id
WHERE i.status = 'IN_PROGRESS'
ORDER BY i.start_time DESC;
```

---

### ✅ **3. Widget: SLA Breach Alert**

**Status: ALERTING**

- **Deskripsi:** Daftar workflow yang sudah melewati batas waktu (SLA).
- **Tabel Utama:** `workflow.workflow_instances`
- **Logika:** Filter dimana `NOW() > due_date`.

**Query Pattern:**

```sql
SELECT instance_id, reference_id, current_step_name, due_date
FROM workflow.workflow_instances
WHERE status = 'IN_PROGRESS'
  AND due_date < NOW();
```

---

### ✅ **4. Widget: Step Performance / Bottleneck**

**Status: ANALYTICS**

- **Deskripsi:** Analisis rata-rata waktu penyelesaian per langkah.
- **Tabel Utama:** `workflow.workflow_step_history` (Log durasi tiap step).
- **Logika:** Menghitung `AVG(end_time - start_time)` per step definition.

**Query Pattern:**

```sql
SELECT step_name, AVG(duration_seconds) as avg_duration
FROM workflow.workflow_step_history
GROUP BY step_name
ORDER BY avg_duration DESC;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Modul ini memantau tabel runtime di schema `workflow`:

1.  `workflow_instances`: Header transaksi proses yang berjalan.
2.  `workflow_step_history`: Detail audit trail durasi per langkah.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/workflow/monitoring?mode=conventional` krusial untuk **Operational Excellence**. Tanpa monitoring ini, bank tidak akan tahu jika ada pengajuan kredit yang "nyangkut" di meja approval selama berminggu-minggu.
