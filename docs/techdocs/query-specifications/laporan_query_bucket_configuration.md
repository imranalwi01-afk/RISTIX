# Laporan Detail Query & Tabel Bucket Configuration

## Menu: DPD Bucket Setup

**URL:** `http://localhost:4231/banking/collective/bucket?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen bucket DPD.

---

### 1. Component: Bucket Scheme Master

- **Nama Sub Menu:** Bucket List
- **Link Sub Menu:** `/banking/collective/bucket`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_bucket_config`
- **Deskripsi:** Daftar skema pengelompokan hari tunggakan.
- **Query:**
  ```sql
  SELECT
      id,
      bucket_code,
      bucket_name,
      description,
      is_default,
      created_date
  FROM public.frs9_imp_ca_bucket_config
  WHERE banking_type = 'conventional'
    AND is_active = true
  ORDER BY is_default DESC, bucket_name;
  ```

---

### 2. Component: Bucket Range Details

- **Nama Sub Menu:** Range Editor
- **Link Sub Menu:** `/banking/collective/bucket/edit`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_bucket_ranges`
- **Deskripsi:** Detail rentang hari (Min-Max) untuk setiap label bucket.
- **Query:**
  ```sql
  SELECT
      id,
      bucket_id,
      bucket_label, -- Current, DPD 1-30, etc.
      min_dpd,
      max_dpd,      -- NULL jika infinity (misal > 90)
      bucket_group, -- PERFORMING, UNDERPERFORMING, NON_PERFORMING
      sequence_no
  FROM public.frs9_imp_ca_bucket_ranges
  WHERE bucket_id = :bucket_id
  ORDER BY sequence_no;
  ```

---

### 3. Component: Usage Check (Segments)

- **Nama Sub Menu:** Usage Mapping
- **Link Sub Menu:** `/banking/collective/bucket`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_segment_config`
- **Deskripsi:** Validasi sebelum menghapus bucket: cek apakah sedang digunakan oleh segmen.
- **Query:**
  ```sql
  SELECT count(*) as usage_count
  FROM public.frs9_imp_ca_segment_config
  WHERE bucket_id = :bucket_id;
  ```
