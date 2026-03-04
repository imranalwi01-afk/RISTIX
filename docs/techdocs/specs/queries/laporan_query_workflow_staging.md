# Laporan Detail Query & Tabel Workflow Staging

## Menu: Staging Override Approval

**URL:** `http://localhost:4231/banking/workflow/staging?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen workflow override staging.

---

### 1. Component: Override Inbox List

- **Nama Sub Menu:** Pending Overrides
- **Link Sub Menu:** `/banking/workflow/staging`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_stage_override`
- **Deskripsi:** Daftar pengajuan override yang aktif dan menunggu persetujuan.
- **Query:**
  ```sql
  SELECT
      o.id as override_id,
      o.request_date,
      o.account_number,
      m.customer_name,
      m.segment_code,
      o.original_stage,
      o.proposed_stage,
      o.reason_category, -- e.g., QUALITATIVE, EXTERNAL_RATING, RESTRUCTURE
      o.status
  FROM public.frs9_stage_override o
  JOIN public.frs9_master_account m ON o.account_number = m.account_number
  WHERE o.status = 'PENDING_APPROVAL'
    AND m.banking_type = 'conventional'
  ORDER BY o.request_date ASC;
  ```

---

### 2. Component: Override Detail & Justification

- **Nama Sub Menu:** Review Detail
- **Link Sub Menu:** `/banking/workflow/staging/view/{id}`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_stage_override`
- **Deskripsi:** Detail alasan dan dokumen pendukung pengajuan.
- **Query:**
  ```sql
  SELECT
      o.id,
      o.justification_text,
      o.attachment_path,
      o.valid_until_date,
      u.full_name as requester_name,
      r.role_name as requester_role
  FROM public.frs9_stage_override o
  LEFT JOIN core.users u ON o.created_by = u.id
  LEFT JOIN core.roles r ON u.role_id = r.id
  WHERE o.id = :override_id;
  ```

---

### 3. Component: Financial Impact (ECL Delta)

- **Nama Sub Menu:** Impact Analysis
- **Link Sub Menu:** `/banking/workflow/staging/impact`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Perbandingan nilai ECL saat ini vs simulasi jika override disetujui.
- **Query:**
  ```sql
  SELECT
      account_number,
      outstanding_balance,
      ecl_amount as current_ecl,
      -- Simulasi sederhana (biasanya lebih kompleks di backend)
      CASE
          WHEN :proposed_stage = '2' THEN ecl_amount * 2.5 -- Asumsi Lifetime ECL > 12m ECL
          WHEN :proposed_stage = '3' THEN outstanding_balance * 0.6 -- Asumsi LGD 60%
          ELSE ecl_amount
      END as simulated_ecl
  FROM public.frs9_master_account
  WHERE account_number = :account_number;
  ```

---

### 4. Component: Approval Action (Execute)

- **Nama Sub Menu:** Approve/Reject
- **Link Sub Menu:** `/banking/workflow/staging/action`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_stage_override`
- **Deskripsi:** Query update untuk mengubah status override.
- **Query:**
  ```sql
  UPDATE public.frs9_stage_override
  SET
      status = :decision, -- APPROVED / REJECTED
      approved_by = :user_id,
      approval_date = NOW(),
      approval_comments = :comments
  WHERE id = :override_id;
  ```
