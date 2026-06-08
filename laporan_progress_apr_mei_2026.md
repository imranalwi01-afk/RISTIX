# PROGRESS REPORT: IFRS 9 System Development

### Periode: 18 April - 19 Mei 2026

---

## 🚀 EXECUTIVE SUMMARY

Memasuki bulan keempat dan kelima tahun 2026, fokus pengembangan beralih secara penuh ke **Individual Impairment (IA) Modul**, **Pemisahan Alur V1/V2**, dan **Penguatan Kualitas Kode Frontend**. Pencapaian terbesar periode ini adalah keberhasilan mengisolasi alur _Individual Impairment V2_ secara penuh dari V1 (legacy) — termasuk API endpoint, UI, approval workflow, dan test coverage — tanpa mengganggu operasional V1 yang sedang berjalan.

Selain itu, dilakukan peningkatan konfigurasi model LGD (penambahan _Max Recovery Period_), pembaruan tampilan tabel EAD, optimasi konfigurasi Docker CI/CD, dan implementasi panduan ketat penggunaan **Material UI v7** sebagai standar pengembangan frontend.

**Update Terakhir (18 Mei 2026):** Finalisasi enhancement pada _Individual Impairment Service_ dengan penambahan _audit logging_ lengkap dan manajemen status penilaian.

---

## 💎 KEY HIGHLIGHTS & ACHIEVEMENTS

### 1. 🔀 Individual Impairment V2 — Isolasi Penuh (MVP)

Ini adalah pencapaian teknis terbesar periode ini. Alur penilaian individual V2 kini beroperasi secara **sepenuhnya terpisah** dari V1:

| Aspek | V1 (Legacy) | V2 (Baru) |
|---|---|---|
| **Route UI** | `/banking/individual/assessment` | `/banking/individual/assessment-new` |
| **API Endpoint** | `/api/v1/banking/individual/impairment` | `/api/v2/individual-impairment` |
| **Approval Flow** | Direct override (tanpa approval) | Approval-driven (`entityType = individual_impairment_v2`) |
| **Label Approval** | — | `Individual Impairment V2` |
| **Status** | ✅ Tetap berjalan | ✅ Fully isolated & live |

- **PR #133 – #137**: Serangkaian PR yang secara bertahap mengisolasi UI, API, dan approval routing V2.
- **PR #138 – #139**: Perbaikan import MUI (`keyframes` dari `@mui/material/styles`), memastikan kepatuhan terhadap MUI v7 API.
- Approval V2 kini mengirimkan notifikasi otomatis ke halaman `/banking/maintenance/approval` dengan label yang tepat.
- Penambahan **dokumen QA** (`individual-impairment-v2-qa.md`) sebagai panduan _manual smoke testing_ dan referensi _automated test coverage_.

### 2. 📋 Audit Logging & Status Management — IA Service

- Pada 18 Mei 2026, dilakukan enhancement besar pada `Individual Impairment Service`:
  - **Audit Logging**: Setiap aksi penilaian (create, update, approve, reject) kini dicatat lengkap dalam audit trail.
  - **Status Management**: State machine untuk status penilaian individual (Draft → Pending Approval → Approved/Rejected) diimplementasikan secara eksplisit.
  - **Riwayat Lengkap**: Perubahan data before/after tersimpan untuk keperluan kepatuhan dan review manajemen.

### 3. 📊 Konfigurasi Model LGD — Max Recovery Period

- Penambahan parameter **Max Recovery Period** pada konfigurasi LGD (_Loss Given Default_).
- Update dilakukan secara end-to-end: backend service, API endpoint, dan frontend UI.
- Memungkinkan tim Risk Analyst mengkalibrasi periode pemulihan maksimum per segmen portofolio, meningkatkan akurasi kalkulasi ECL.

### 4. 🗂️ Pembaruan Tabel & UI Kolektif

- **EAD Model**: Pembaruan kolom dan layout tabel EAD Setup untuk menampilkan informasi model dengan lebih jelas.
- **Product Table**: Perbaikan tampilan tabel produk dan respons API (`fix: fixing product api response`).
- **Approval Page**: Perbaikan alur dan tampilan halaman approval (`fix: fixing approval page`).
- **Amortization Event**: Pembaruan konfigurasi event amortisasi.
- **Segmentasi & FL Scalar**: Update komponen grid dan layout tabel pada modul segmentasi dan FL Scalar.

### 5. 🐳 DevOps & Docker CI/CD Cleanup

- **Fix Docker Workflow**: Penghapusan environment `'prod'` yang tidak perlu dari workflow `docker-publish-prod.yml` dan `docker-publish-r.yml`.
- **Dockerfile.dev Frontend**: Optimasi image development frontend agar dependency pre-installed, mempercepat waktu startup container.
- **Local Docker Environment**: Konfigurasi `ops/local/docker-compose.yml` disesuaikan untuk mendukung koneksi remote DB via VPN.

### 6. 📐 Standarisasi Material UI v7

- Penambahan file **panduan resmi** penggunaan Material UI v7 di direktori `AGENTS.md` dan `CLAUDE.md`.
- Penegasan aturan ketat:
  - ✅ `import Grid from '@mui/material/Grid'` — satu-satunya cara import Grid yang diizinkan.
  - ✅ Sizing via `size={{ xs: 12, md: 6 }}` — bukan prop `item` legacy.
  - ❌ Dilarang menggunakan `Grid2`, `Unstable_Grid2`, atau import dari `@mui/system`.
- Mandatory check sebelum setiap PR frontend yang menyentuh MUI components.

### 7. 📁 Sample Data & Test Cases

- Penambahan file sample untuk Individual Assessment:
  - `DCF_LOSS_CASE.csv` — Skenario DCF dengan kerugian (loss case).
  - `DCF_SAMPLE_NON_ZERO.csv` — Skenario DCF dengan nilai non-zero untuk validasi kalkulasi.
  - `IA_FLOWS.sql` — Skrip SQL alur data Individual Assessment.
  - `README.md` — Dokumentasi penggunaan sample data.

---

## 🛠️ TECHNICAL IMPROVEMENTS

| Area | Improvements |
|---|---|
| **Individual Impairment** | Isolasi penuh V1/V2: route, API, approval, UI, test coverage |
| **Audit & Compliance** | Implementasi audit logging dan status management pada IA Service |
| **Model Konfigurasi** | Penambahan Max Recovery Period pada LGD model configuration |
| **Frontend/UI** | Update EAD table, Product table, Approval page, Amortization event |
| **MUI Compliance** | Standarisasi MUI v7 API — `keyframes` dari `@mui/material/styles` |
| **DevOps** | Docker CI/CD cleanup, Dockerfile.dev optimization, VPN remote DB support |
| **Dokumentasi** | QA notes V2, sample DCF test files, panduan MUI v7, Engineering Backlog |

---

## 📂 DOKUMENTASI TEKNIS YANG DISELESAIKAN

1. **Individual Impairment V2 QA Notes** (`docs/techdocs/individual-impairment-v2-qa.md`)
   - Route & API mapping V1 vs V2
   - Approval behavior specification
   - Manual smoke checklist (7 langkah)
   - Automated test coverage mapping

2. **Engineering Backlog** (`docs/techdocs/reports/progress/ENGINEERING_BACKLOG.md`)
   - Dokumentasi item teknis yang ditangguhkan: standarisasi sumber data dashboard ke `frs9_master_account`
   - Capture state saat ini vs target state

3. **Sample Data Individual Assessment** (`docs/techdocs/samples/individual-impairment/`)
   - File CSV untuk skenario DCF loss dan non-zero
   - SQL script alur IA
   - README panduan penggunaan

4. **Material UI v7 Guidelines** (diperbarui di `AGENTS.md` & `CLAUDE.md`)
   - Aturan Grid API, import path, dan pre-PR checks

---

## 📈 PROJECT METRICS & STATISTICS

### Aktivitas Pengembangan (18 Apr – 19 Mei 2026)

| Metrik | Jumlah |
|---|---|
| **Total Commits** | 57 commits |
| **Pull Requests Merged** | 17 PRs (#121 – #139) |
| **Files Changed** | 50+ file (frontend, backend, docs, ops) |
| **New Features** | 8+ fitur baru |
| **Bug Fixes** | 7+ perbaikan bug |
| **Test Cases Added** | 4 test suites baru (IA V2 coverage) |
| **Documentation** | 4 dokumen teknis baru/diperbarui |

### Distribusi Pekerjaan Per Minggu

| Minggu | Fokus Utama | PRs |
|---|---|---|
| **18–24 Apr** | Table UI updates, EAD model, Approval fixes, Environment config | #121–#129 |
| **25 Apr–1 Mei** | Individual Impairment V2 isolation, Amortization event | #130–#137 |
| **2–8 Mei** | MUI keyframes fix, IA V2 boundary hardening | #138–#139 |
| **9–19 Mei** | DCF samples, Docker CI/CD fix, LGD max recovery, Audit logging IA | — |

---

## 🐛 CHALLENGES & SOLUTIONS

### Challenge 1: Isolasi V1/V2 Tanpa Breaking Change

**Masalah:** Memisahkan alur Individual Impairment V2 tanpa mengganggu V1 yang sudah berjalan di production.

**Solusi:**
- Pendekatan bertahap melalui 7 PR terpisah (PR #131–#137) dengan scope yang terdefinisi ketat per PR.
- V1 API (`/api/v1/...`) dipertahankan tanpa modifikasi — hanya V2 yang mendapat route baru.
- Setiap PR disertai test case yang memvalidasi tidak ada regresi pada V1.

### Challenge 2: Kepatuhan MUI v7 API

**Masalah:** Import `keyframes` dari `@mui/system` menyebabkan compile error pada Next.js 16.1.x dengan MUI v7.

**Solusi:**
- Fix di PR #138: Migrasi semua import `keyframes` ke `@mui/material/styles`.
- Penetapan aturan resmi di `AGENTS.md` dan mandatory grep check sebelum setiap PR frontend.

### Challenge 3: Docker Workflow — Environment 'prod'

**Masalah:** Tag environment `'prod'` pada GitHub Actions workflow menyebabkan konflik deployment.

**Solusi:**
- Dihapus dari `docker-publish-prod.yml` dan `docker-publish-r.yml`.
- Workflow kini menggunakan environment `production` yang konsisten.

---

## 📉 DEFERRED ITEMS (ENGINEERING BACKLOG)

Item berikut disepakati untuk ditangguhkan dan dicatat di Engineering Backlog:

- **Dashboard Data Source Standardization**: Dashboard KPI dan portfolio trend masih menggunakan `frs9_imp_ca_result_h` sebagai fallback ke `frs9_master_account`. Target: standarisasi penuh ke `frs9_master_account`. Scope: update `ifrs9-calculations.service.ts` dan verifikasi KPI values.

---

## 📈 NEXT STEPS (RENCANA LANJUTAN — JUN 2026)

- [ ] **Dashboard Standardization**: Eksekusi item backlog — standarisasi sumber data dashboard ke `frs9_master_account`.
- [ ] **UAT Gelombang 2**: Sesi User Acceptance Testing modul Individual Impairment V2 dengan tim Risk & Accounting.
- [ ] **Reporting Export**: Finalisasi unduh PDF/Excel untuk Laporan Nominatif ECL Individual.
- [ ] **Performance Tuning IA V2**: Stress test endpoint V2 dengan volume data portofolio skala production.
- [ ] **Security Hardening**: Review dan penutupan endpoint API yang belum dilindungi sebelum Go-Live.
- [ ] **IA V2 Full Go-Live**: Promosi V2 menjadi jalur utama setelah UAT selesai.

---

**Status:** ✅ **ON TRACK — MAJOR MILESTONE ACHIEVED**
**Reporter:** Antigravity (AI Code Assist)
**Tanggal Laporan:** 1 Juni 2026
**Periode Coverage:** 18 April – 19 Mei 2026
