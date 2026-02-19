# Analisis Detail Link Bucket Configuration

## URL: http://localhost:4231/banking/collective/bucket?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi _Days Past Due (DPD) Buckets_.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Collective Impairment (`/banking/collective`)
- **Child:** Bucket Configuration (`/banking/collective/bucket`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi untuk mendefinisikan rentang hari tunggakan (DPD Ranges) yang digunakan dalam analisis _Roll Rate_ (Transition Matrix).

Contoh Bucket:

1.  **Current:** 0 DPD
2.  **1-30 DPD:** 1 s/d 30 hari
3.  **31-60 DPD:** 31 s/d 60 hari
4.  **Default:** > 90 hari

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: Bucket Scheme List**

**Status: CORE CONFIGURATION**

- **Deskripsi:** Daftar skema bucket yang tersedia. Bank mungkin memiliki skema berbeda untuk kartu kredit vs KPR.
- **Tabel Utama:** `public.frs9_imp_ca_bucket_config` (Database: FRS9PRO)
- **Logika:** Menampilkan header konfigurasi.

**Query Pattern:**

```sql
SELECT bucket_id, bucket_name, description, is_active
FROM public.frs9_imp_ca_bucket_config
WHERE banking_type = 'conventional'
ORDER BY bucket_name;
```

---

### ✅ **2. Form: Bucket Ranges (Detail)**

**Status: LOGIC DEFINITION**

- **Deskripsi:** Definisi batas bawah dan atas untuk setiap bucket.
- **Tabel Utama:** `public.frs9_imp_ca_bucket_ranges`
- **Logika:** `min_dpd` dan `max_dpd` tidak boleh tumpang tindih (overlap).

**Query Pattern:**

```sql
SELECT
    range_id, bucket_id,
    bucket_label, -- e.g., "1-30 Days"
    min_dpd,
    max_dpd,
    bucket_order
FROM public.frs9_imp_ca_bucket_ranges
WHERE bucket_id = :selected_bucket_id
ORDER BY bucket_order;
```

---

### ✅ **3. Widget: Segment Mapping**

**Status: ASSOCIATION**

- **Deskripsi:** Menentukan segmen mana yang menggunakan skema bucket ini.
- **Tabel Utama:** `public.frs9_imp_ca_segment_config`
- **Logika:** Update kolom `bucket_id` pada tabel segmen.

**Query Pattern:**

```sql
SELECT segment_name, segment_type
FROM public.frs9_imp_ca_segment_config
WHERE bucket_id = :selected_bucket_id;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Data bucket tersimpan di database **FRS9PRO** (Schema `public`):

1.  `frs9_imp_ca_bucket_config`: Header skema.
2.  `frs9_imp_ca_bucket_ranges`: Detail rentang DPD.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/collective/bucket?mode=conventional` sangat penting untuk **Transition Matrix**. Jika bucket tidak didefinisikan dengan benar, matriks perpindahan probabilitas (Probability Transition Matrix) tidak dapat dihitung.
