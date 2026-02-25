# Laporan Detail Query & Tabel Application Setup

## Menu: Application Configuration

**URL:** `http://localhost:4231/banking/setup/application?mode=conventional`

Berikut adalah rincian teknis query untuk komponen konfigurasi aplikasi.

---

### 1. Component: System Parameters (General)

- **Nama Sub Menu:** Application Setup (General)
- **Link Sub Menu:** `/banking/setup/application`
- **Database:** `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `configuration`
- **Deskripsi:** Mengambil parameter konfigurasi umum aplikasi.
- **Query:**
  ```sql
  SELECT
      config_key,
      config_value,
      data_type,
      description
  FROM core.configuration
  WHERE category IN ('GENERAL', 'APPLICATION')
    AND is_visible = true
  ORDER BY sort_order;
  ```

---

### 2. Component: Business Date Management

- **Nama Sub Menu:** Application Setup (System Date)
- **Link Sub Menu:** `/banking/setup/application`
- **Database:** `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `configuration`
- **Deskripsi:** Mengambil tanggal sistem saat ini untuk operasi perbankan.
- **Query:**
  ```sql
  SELECT config_value as system_date
  FROM core.configuration
  WHERE config_key = 'CURRENT_BUSINESS_DATE';
  ```

---

### 3. Component: Last EOD Status

- **Nama Sub Menu:** Application Setup (EOD Monitor)
- **Link Sub Menu:** `/banking/setup/application`
- **Database:** `FRS9PRO` (atau Platform Local)
- **Skema:** `public`
- **Nama Tabel:** `job_executions`
- **Deskripsi:** Menampilkan status terakhir proses End of Day untuk memastikan sistem siap untuk tanggal baru.
- **Query:**
  ```sql
  SELECT
      job_instance_id,
      status,
      start_time,
      end_time,
      exit_code,
      exit_message
  FROM public.job_executions
  WHERE job_name LIKE 'EOD_BATCH_%'
  ORDER BY start_time DESC
  LIMIT 1;
  ```

---

### 4. Component: Tenant Information

- **Nama Sub Menu:** Application Setup (Tenant Profile)
- **Link Sub Menu:** `/banking/setup/application`
- **Database:** `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `tenant_profile`
- **Deskripsi:** Detail informasi bank/tenant yang sedang login.
- **Query:**
  ```sql
  SELECT code, name, description, status, timezone
  FROM core.tenant_profile;
  ```

```

Analisis ini melengkapi dokumentasi untuk modul **System Setup**, yang berfokus pada tabel konfigurasi di schema `platform_admin` dan status job di schema `public`.

<!--
[PROMPT_SUGGESTION]buatkan script SQL untuk insert default configuration parameters ke tabel platform_admin.configuration[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]bagaimana cara menangani perubahan system date agar tidak merusak data historis di tabel transaksi?[/PROMPT_SUGGESTION]
-->
```
