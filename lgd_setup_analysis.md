# Analisis Detail Link LGD Setup

## URL: http://localhost:4231/banking/collective/lgd-setup?mode=conventional

Dokumen ini menganalisis aliran data dan komponen teknis untuk halaman konfigurasi model _Loss Given Default (LGD)_.

---

## 📋 STRUKTUR MENU

### **Menu Path:**

- **Root:** Banking (`/banking`)
- **Parent:** Collective Impairment (`/banking/collective`)
- **Child:** LGD Setup (`/banking/collective/lgd-setup`)
- **Mode Filter:** `?mode=conventional`

### **Fungsi Halaman:**

Halaman ini berfungsi untuk mengelola model estimasi kerugian. LGD didefinisikan sebagai persentase eksposur yang tidak dapat dipulihkan saat terjadi default (`LGD = 1 - Recovery Rate`).

Pendekatan LGD Umum:

1.  **Unsecured:** Berdasarkan _Historical Recovery Rate_ dari akun yang sudah write-off.
2.  **Secured:** Berdasarkan nilai agunan (Collateral Value) dikurangi _Haircut_ dan biaya penjualan.

---

## 🔍 ANALISIS KOMPONEN & KONEKSI TABEL

### ✅ **1. Widget: LGD Model Master**

**Status: CORE CONFIGURATION**

- **Deskripsi:** Daftar model LGD yang tersedia (misal: "LGD Komersial", "LGD KPR").
- **Tabel Utama:** `public.frs9_imp_ca_lgd_config` (Database: FRS9PRO)
- **Logika:** Memisahkan model berdasarkan tipe portofolio (Secured vs Unsecured).

**Query Pattern:**

```sql
SELECT config_id, model_name, method, status, created_date
FROM public.frs9_imp_ca_lgd_config
WHERE banking_type = 'conventional'
ORDER BY created_date DESC;
```

---

### ✅ **2. Widget: Collateral Haircut & Recovery**

**Status: DATA INPUT**

- **Deskripsi:** Input nilai _Recovery Rate_ atau _Haircut_ untuk setiap jenis agunan.
- **Tabel Utama:** `public.frs9_imp_ca_lgd_data`
- **Logika:** Jika metode Secured, LGD dihitung per akun berdasarkan agunan. Jika Unsecured, LGD biasanya flat rate per segmen.

**Query Pattern:**

```sql
SELECT
    d.id, d.collateral_type,
    d.haircut_percent,
    d.recovery_rate,
    d.time_to_recovery_years
FROM public.frs9_imp_ca_lgd_data d
WHERE d.lgd_config_id = :selected_config_id
ORDER BY d.collateral_type;
```

---

### ✅ **3. Widget: Historical Recovery Analysis**

**Status: ANALYTICS**

- **Deskripsi:** Statistik pemulihan historis untuk memvalidasi asumsi LGD.
- **Tabel Utama:** `public.frs9_imp_ca_recovery_history`
- **Logika:** Menghitung rata-rata pengembalian kas dari akun NPL.

**Query Pattern:**

```sql
SELECT
    year_default,
    total_npl_amount,
    total_recovered_amount,
    (total_recovered_amount / total_npl_amount) * 100 as actual_recovery_rate
FROM public.frs9_imp_ca_recovery_history
WHERE segment_type = :segment_type;
```

---

### ✅ **4. Widget: Segment Mapping**

**Status: ASSOCIATION**

- **Deskripsi:** Menentukan segmen mana yang menggunakan model LGD ini.
- **Tabel Utama:** `public.frs9_imp_ca_segment_config`
- **Logika:** Update kolom `lgd_config_id` pada tabel segmen.

**Query Pattern:**

```sql
SELECT segment_name, segment_type
FROM public.frs9_imp_ca_segment_config
WHERE lgd_config_id = :selected_config_id;
```

---

## 📊 RINGKASAN SKEMA DATABASE

Data model LGD tersimpan di database **FRS9PRO** (Schema `public`):

1.  `frs9_imp_ca_lgd_config`: Header model.
2.  `frs9_imp_ca_lgd_data`: Parameter detail (Haircut/Recovery).
3.  `frs9_imp_ca_recovery_history`: Data pendukung validasi.

## 🎯 KESIMPULAN

URL `http://localhost:4231/banking/collective/lgd-setup?mode=conventional` mengelola parameter "Severity of Loss". Nilai LGD yang terlalu rendah (Optimis) akan menyebabkan _Under-provisioning_, sedangkan terlalu tinggi (Pesimis) akan membebani modal bank.
