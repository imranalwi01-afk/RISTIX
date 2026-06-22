# Panduan Permission IFRS9 IAF

## Navigasi Cepat Berdasarkan Role

| Role | Hierarchy | Permission Coverage |
|------|-----------|-------------------|
| **SUPERADMIN** | 100 | Semua permission (bypass) |
| **TENANT_ADMIN** | 90 | Semua admin + full banking |
| **BANK_CRO** | 80 | Semua banking + approval critical |
| **IFRS_MANAGER** | 70 | Full banking, reports, processing |
| **PORTFOLIO_MANAGER** | 60 | Collective, reports, individual |
| **RISK_ANALYST / CHECKER** | 50 | View + edit, approval level 1 |
| **DATA_ADMIN** | 40 | Parameter, tools, processing |
| **REPORT_ANALYST** | 30 | Reports view only |
| **AUDITOR** | 20 | View all, no edit |
| **VIEWER / MAKER** | 10 | Dashboard + view specific |

---

## Cara Membaca Dokumentasi Ini

```
banking.collective.pd.view  ← Kode permission
└─────┴──────┴──┴──┴──┘
  Modul  Sub   Resource  Aksi

banking    → Modul banking (frontend)
collective → Sub-modul Collective Impairment
pd         → Resource PD Setup
view       → Aksi: lihat data
```

### Hierarki Permission

Setiap resource memiliki permission dengan pola CRUD + akses:

| Aksi | Prefix | Efek |
|------|--------|------|
| `{resource}` (tanpa aksi) | Base | **Akses menu** — permission ini diperlukan untuk melihat menu di sidebar |
| `{resource}.access` | Access | Alternatif untuk akses menu |
| `{resource}.view` | View | Lihat data di tabel/detail |
| `{resource}.create` | Create | Tombol Add/Buat |
| `{resource}.update` | Update | Tombol Edit/Ubah |
| `{resource}.delete` | Delete | Tombol Delete/Hapus |
| `{resource}.manage` | Manage | **Mencakup view + create + update + delete** |
| `{resource}.export` | Export | Tombol Export/Ekspor |
| `{resource}.approve` | Approve | Tombol Approve/Setujui |

> **Penting:** Permission `manage` TIDAK otomatis memberi akses menu. Menu butuh `{resource}` (base) atau `{resource}.access` secara terpisah.

---

## ADMINISTRATION

### Maintenance & System

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `admin.maintenance.access` | **Akses menu Maintenance** | Sidebar → Admin & Maintenance (parent menu) |
| `admin.super_admin` | **Bypass semua permission** | Semua menu & tombol (hardcoded bypass) |
| `admin.system.view` | Lihat menu administrasi sistem | Platform → System |
| `admin.system.manage` | Kelola pengaturan platform | Platform → settings, konfigurasi |

### User Management

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `admin.users.view` | Lihat daftar users | Maintenance → Users → tabel |
| `admin.users.manage` | Buat, ubah, hapus user. Reset password, aktif/nonaktifkan | Users → button Add, Edit, Delete, Reset Password, Toggle Active |

Menu **Access Management** muncul jika user punya `admin.users.manage` ATAU `admin.roles.manage` (bersama `admin.maintenance.access`).

### Role Management

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `admin.roles.view` | Lihat daftar roles | Access Management → tab Roles → tabel |
| `admin.roles.create` | Buat role baru | Roles → button Create Role |
| `admin.roles.manage` | Edit, delete role, atur permission | Roles → Edit, Delete, Manage Permissions |

### Notifications

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `notifications.view` | Lihat notifikasi | Icon bell di navbar, halaman Notifications |
| `notifications.manage` | Kelola notifikasi (tandai baca, hapus) | Dropdown notifikasi |
| `notifications.preferences.manage` | Atur preferensi notifikasi | Settings → Notifikasi (mute, quiet hours) |

### Job Monitoring

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `jobs.access` | **Akses menu Job Monitoring** | Sidebar → Maintenance → Job Monitoring |
| `jobs.view` | Lihat daftar job + history | Job Monitoring → tabel Active Jobs & Job History |
| `jobs.create` | Buat job definition baru | Job Monitoring → button Create Job |
| `jobs.update` | Ubah job definition | Job Monitoring → Edit Job |
| `jobs.delete` | Hapus job definition | Job Monitoring → Delete Job |
| `jobs.run` | Jalankan job (trigger execution) | Job Monitoring → button Run Now |
| `jobs.control` | Kontrol job (pause, stop, restart) | Tombol kontrol di detail job |
| `jobs.manage` | Mencakup view + create + update + delete + run + control | Semua aksi job |
| `jobs.approve` | Setujui job yang butuh approval | Approval workflow untuk jobs |
| `jobs.runtime.view` | Lihat diagnosa runtime job aktif | Detail dialog → tab Runtime |

---

## BANKING — DASHBOARD

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.dashboard.view` | **Akses menu Dashboard** | Sidebar → Dashboard, lihat widget |
| `banking.dashboard.manage` | Kelola widget dashboard | Dashboard → settings/widget |

---

## BANKING — ANALYTICS

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.analytics.view` | **Akses menu Advanced Analytics** | Sidebar → Advanced Analytics (parent) |
| `banking.analytics.r.view` | Lihat halaman R Analytics | Advanced Analytics → R Analytics |

---

## BANKING — SYSTEM SETUP

### Application Configuration

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.setup.application` | **Akses menu Application Config** | Sidebar → System Setup → Application Configuration |
| `banking.setup.application.view` | Lihat daftar + detail konfigurasi | Tabel aplikasi |
| `banking.setup.application.create` | Buat konfigurasi baru | Button Add |
| `banking.setup.application.update` | Ubah konfigurasi | Button Edit |
| `banking.setup.application.delete` | Hapus konfigurasi | Button Delete |
| `banking.setup.application.manage` | Mencakup semua aksi di atas | — |

### Business Configuration

Business Configuration mengelola business settings (parameter bisnis seperti kode GL, threshold, dll).

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.setup.business` | **Akses menu Business Config** | Sidebar → System Setup → Business Configuration |
| `banking.setup.business.view` | Lihat daftar header + detail setting | Tabel, dialog detail |
| `banking.setup.business.create` | Buat header setting baru | Button Add |
| `banking.setup.business.update` | Ubah header/detail setting | Button Edit |
| `banking.setup.business.delete` | Hapus header/detail setting | Button Delete |
| `banking.setup.business.manage` | Mencakup semua aksi di atas | — |

**Contoh business settings yang dikelola:**
- B0001 — Currency
- B0005 — Journal Type
- B0006 — Journal Code
- B0007 — DB/CR
- B0008 — Rule Type
- B0011 — Product Segment
- B0031 — Impact Level Configuration

---

## BANKING — PARAMETER MANAGEMENT

### Product Parameters

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.parameter.product` | **Akses menu Product Parameters** | Sidebar → Parameter Management → Product Parameters |
| `banking.parameter.product.view` | Lihat daftar product parameter | Tabel produk |
| `banking.parameter.product.create` | Buat product parameter baru | Button Add |
| `banking.parameter.product.update` | Ubah product parameter | Button Edit |
| `banking.parameter.product.delete` | Hapus product parameter | Button Delete |
| `banking.parameter.product.manage` | Mencakup view + create + update + delete | — |
| `banking.parameter.product.export` | Ekspor data product parameter | Button Export |

### Accounting (Journal) Parameters

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.parameter.journal` | **Akses menu Accounting Parameters** | Sidebar → Parameter Management → Accounting Parameters |
| `banking.parameter.journal.view` | Lihat daftar journal parameter | Tabel jurnal |
| `banking.parameter.journal.create` | Buat journal parameter baru | Button Add |
| `banking.parameter.journal.update` | Ubah journal parameter | Button Edit |
| `banking.parameter.journal.delete` | Hapus journal parameter | Button Delete |
| `banking.parameter.journal.manage` | Mencakup semua aksi di atas | — |
| `banking.parameter.journal.export` | Ekspor data journal parameter | Button Export |

### Segmentation Configuration

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.parameter.segmentation` | **Akses menu Segmentation** | Sidebar → Parameter Management → Segmentation |
| `banking.parameter.segmentation.view` | Lihat daftar segmentasi | Tabel segmentasi |
| `banking.parameter.segmentation.create` | Buat segmentasi baru | Button Add |
| `banking.parameter.segmentation.update` | Ubah segmentasi | Button Edit |
| `banking.parameter.segmentation.delete` | Hapus segmentasi | Button Delete |
| `banking.parameter.segmentation.manage` | Mencakup semua aksi di atas | — |
| `banking.parameter.segmentation.export` | Ekspor data segmentasi | Button Export |

---

## BANKING — COLLECTIVE IMPAIRMENT

### Akses Modul

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.collective` | **Akses menu Collective Impairment** | Sidebar → Collective Impairment (parent) |
| `banking.collective.view` | Lihat halaman utama collective | Collective Impairment |
| `banking.collective.manage` | Mencakup semua aksi collective | Semua halaman collective |

### Rule Base Setting

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.collective.rule_base` | **Akses menu Rule Base Setting** | Collective → Rule Base Setting |
| `banking.collective.rule_base.view` | Lihat daftar rule header + detail | Tabel rule base |
| `banking.collective.rule_base.create` | Buat rule header + detail baru | Button Add |
| `banking.collective.rule_base.update` | Ubah rule header + detail | Button Edit, Query Preview |
| `banking.collective.rule_base.delete` | Hapus rule | Button Delete |
| `banking.collective.rule_base.manage` | Mencakup semua aksi di atas | — |

### Bucket Parameter

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.collective.bucket` | **Akses menu Bucket Parameter** | Collective → Bucket Parameter |
| `banking.collective.bucket.view` | Lihat daftar bucket | Tabel bucket |
| `banking.collective.bucket.create` | Buat bucket baru | Button Add |
| `banking.collective.bucket.update` | Ubah bucket | Button Edit |
| `banking.collective.bucket.delete` | Hapus bucket | Button Delete |
| `banking.collective.bucket.manage` | Mencakup semua aksi di atas | — |

### PD Setup

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.collective.pd` | **Akses menu PD Setup** | Collective → PD Setup |
| `banking.collective.pd.view` | Lihat daftar PD configuration | Tabel PD |
| `banking.collective.pd.create` | Buat PD configuration baru | Button Add Configuration |
| `banking.collective.pd.update` | Ubah PD configuration | Button Edit |
| `banking.collective.pd.delete` | Hapus PD configuration | Button Delete |
| `banking.collective.pd.manage` | Mencakup semua aksi di atas | — |

### LGD Setup

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.collective.lgd` | **Akses menu LGD Setup** | Collective → LGD Setup |
| `banking.collective.lgd.view` | Lihat daftar LGD configuration | Tabel LGD |
| `banking.collective.lgd.create` | Buat LGD configuration baru | Button Add Configuration |
| `banking.collective.lgd.update` | Ubah LGD configuration | Button Edit |
| `banking.collective.lgd.delete` | Hapus LGD configuration | Button Delete |
| `banking.collective.lgd.manage` | Mencakup semua aksi di atas | — |

### EAD Setup

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.collective.ead` | **Akses menu EAD Setup** | Collective → EAD Setup |
| `banking.collective.ead.view` | Lihat daftar EAD configuration | Tabel EAD |
| `banking.collective.ead.create` | Buat EAD configuration baru | Button Add Configuration |
| `banking.collective.ead.update` | Ubah EAD configuration | Button Edit |
| `banking.collective.ead.delete` | Hapus EAD configuration | Button Delete |
| `banking.collective.ead.manage` | Mencakup semua aksi di atas | — |

### ECL Configuration

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.collective.ecl` | **Akses menu ECL Config** | Collective → ECL Configuration |
| `banking.collective.ecl.view` | Lihat daftar ECL configuration | Tabel ECL |
| `banking.collective.ecl.create` | Buat ECL configuration baru | Button Add |
| `banking.collective.ecl.update` | Ubah ECL configuration | Button Edit |
| `banking.collective.ecl.delete` | Hapus ECL configuration | Button Delete |
| `banking.collective.ecl.manage` | Mencakup semua aksi di atas | — |

### FL Scalar

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.collective.fl_scalar` | **Akses menu FL Scalar** | Collective → FL Scalar |
| `banking.collective.fl_scalar.view` | Lihat daftar FL Scalar | Tabel FL Scalar |
| `banking.collective.fl_scalar.create` | Buat FL Scalar baru | Button Add |
| `banking.collective.fl_scalar.update` | Ubah FL Scalar | Button Edit |
| `banking.collective.fl_scalar.delete` | Hapus FL Scalar | Button Delete |
| `banking.collective.fl_scalar.manage` | Mencakup semua aksi di atas | — |

---

## BANKING — INDIVIDUAL IMPAIRMENT

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.individual` | **Akses menu Individual Impairment** | Sidebar → Individual Impairment |
| `banking.individual.view` | Lihat daftar assessment individual | Tabel individual impairment |
| `banking.individual.create` | Buat assessment individual baru | Button Add |
| `banking.individual.manage` | Mencakup view + create + edit | — |
| `banking.individual.export` | Ekspor data individual | Button Export |
| `banking.individual.approve` | Setujui perubahan individual | Approval workflow |

---

## BANKING — IFRS 9 PROCESSING

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.processing` | **Akses menu IFRS 9 Processing** | Sidebar → IFRS 9 Processing (parent) |
| `banking.processing.view` | Lihat halaman utama processing | Processing |
| `banking.processing.manage` | Run calculation, manage processing | Button Run, dll. |

### Impairment Module

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.processing.impairment` | **Akses menu Impairment Module** | Processing → Impairment Module |
| `banking.processing.impairment.view` | Lihat data impairment module | Tabel impairment |
| `banking.processing.impairment.manage` | Kelola penuh impairment module | Semua aksi |

### Amortization Module

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.processing.amortization` | **Akses menu Amortization Module** | Processing → Amortization Module |
| `banking.processing.amortization.view` | Lihat data amortization module | Tabel amortization |
| `banking.processing.amortization.manage` | Kelola penuh amortization module | Semua aksi |

---

## BANKING — IFRS 9 REPORTS

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.reports.ifrs9` | **Akses menu IFRS 9 Reports** | Sidebar → IFRS 9 Reports (parent) |
| `banking.reports.ifrs9.view` | Lihat halaman reports | IFRS 9 Reports |
| `banking.reports.ifrs9.manage` | Kelola pengaturan report | Reports → settings |
| `banking.reports.ifrs9.export` | Ekspor data report (semua sub-report) | Button Export |

Setiap sub-report butuh permission `access` + `view`:

| Sub-Report | Permission Access | Permission View | Konten |
|-----------|------------------|----------------|--------|
| **Nominative** | `banking.reports.ifrs9.nominative` | `.nominative.view` | Tabel nominatif + filter |
| **Lifetime PD** | `banking.reports.ifrs9.lifetime_pd` | `.lifetime_pd.view` | Tabel, chart PD lifetime |
| **Lifetime LGD** | `banking.reports.ifrs9.lifetime_lgd` | `.lifetime_lgd.view` | Tabel, chart LGD lifetime |
| **EAD Model** | `banking.reports.ifrs9.ead_model` | `.ead_model.view` | Tabel, chart EAD model |
| **ECL Result** | `banking.reports.ifrs9.ecl_result` | `.ecl_result.view` | Tabel, chart, KPI cards |
| **ECL Movement** | `banking.reports.ifrs9.ecl_movement` | `.ecl_movement.view` | Tabel movement |
| **GCA Movement** | `banking.reports.ifrs9.gca_movement` | `.gca_movement.view` | Tabel GCA movement |

---

## BANKING — TOOLS

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.configuration.ifrs9` | **Akses menu Tools** | Sidebar → Tools (parent) |
| `banking.configuration.ifrs9.manage` | Kelola semua tools | Semua sub-menu Tools |

### Manual Upload

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.tools.upload.view` | Lihat halaman Manual Upload | Tools → Manual Upload |
| `banking.tools.upload.create` | Upload file baru | Button Upload |
| `banking.tools.upload.manage` | Kelola file (hapus, dll) | Button Delete |

### Data Export

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.tools.export.view` | Lihat halaman Data Export | Tools → Data Export |
| `banking.tools.export.manage` | Export data | Semua aksi export |

### ETL Tools

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `banking.tools.etl.view` | Lihat halaman ETL | Tools → ETL Tools |
| `banking.tools.etl.create` | Buat job ETL baru | Button Add |
| `banking.tools.etl.update` | Ubah konfigurasi ETL | Button Edit |
| `banking.tools.etl.run` | Jalankan proses ETL | Button Run |
| `banking.tools.etl.manage` | Semua aksi ETL | — |

---

## WORKFLOW (Approval)

### Approval Requests

| Permission | Fungsi | Menu/Tombol |
|-----------|--------|-------------|
| `approval.requests.approve` | Review dan setujui pending request | Approval → Approve/Reject |
| `approval.all` | Override batasan approval | Bypass semua |
| `approval.requests.self_approve_override` | Setujui request sendiri | Self-approve jika diizinkan |

### Approval per Entity (Approve Create/Update/Delete)

Setiap entity di bawah butuh approval terpisah:

| Entity | Permission Pattern | Contoh Aksi |
|--------|-------------------|-------------|
| **User** | `approval.user.{create,update,delete}` | Tambah/hapus user butuh approval |
| **Role** | `approval.role.{create,update,delete}` | Buat role baru |
| **Role Assignment** | `approval.role_assignment.{create,update,delete}` | Assign user ke role |
| **Role Permission** | `approval.role_permission.{create,update,delete}` | Ubah permission role |
| **User Status** | `approval.user_status.{create,update,delete}` | Aktif/nonaktifkan user |
| **Parameter** | `approval.parameter.{create,update,delete}` | Parameter umum |
| **Product Parameter** | `approval.product_parameter.{create,update,delete}` | Product parameter |
| **Journal Parameter** | `approval.journal_parameter.{create,update,delete}` | Journal parameter |
| **Segmentation** | `approval.segmentation.{create,update,delete}` | Segmentasi |
| **Configuration** | `approval.configuration.{create,update,delete}` | Konfigurasi sistem |
| **Rule Base** | `approval.rule_base_setting.{create,update,delete}` | Rule base |
| **Bucket** | `approval.bucket_parameter.{create,update,delete}` | Bucket parameter |
| **PD Config** | `approval.pd_configuration.{create,update,delete}` | PD setup |
| **LGD Config** | `approval.lgd_configuration.{create,update,delete}` | LGD setup |
| **EAD Config** | `approval.ead_configuration.{create,update,delete}` | EAD setup |
| **ECL Config** | `approval.ecl_configuration.{create,update,delete}` | ECL config |
| **FL Scalar** | `approval.fl_scalar.{create,update,delete}` | FL Scalar |

---

## Menu Sidebar — Permission Required

Berikut permission yang diperlukan agar menu muncul di sidebar:

| Menu Sidebar | Permission Required |
|-------------|-------------------|
| Dashboard | `banking.dashboard.view` |
| System Setup (parent) | `banking.setup.application` |
| Application Configuration | `banking.setup.application.view` |
| Business Configuration | `banking.setup.business.view` |
| Parameter Management (parent) | `banking.parameter` |
| Product Parameters | `banking.parameter.product.view` |
| Accounting Parameters | `banking.parameter.journal.view` |
| Segmentation Configuration | `banking.parameter.segmentation.view` |
| Collective Impairment (parent) | `banking.collective` + `collective.view` |
| Rule Base Setting | `banking.collective.rule_base.view` |
| Bucket Parameter | `banking.collective.bucket.view` |
| PD Setup | `banking.collective.pd.view` |
| LGD Setup | `banking.collective.lgd.view` |
| EAD Setup | `banking.collective.ead.view` |
| ECL Configuration | `banking.collective.ecl.view` |
| FL Scalar | `banking.collective.fl_scalar.view` |
| Individual Impairment | `banking.individual` |
| IFRS 9 Processing (parent) | `banking.processing.view` |
| Impairment Module | `banking.processing.impairment.view` |
| Amortization Module | `banking.processing.amortization.view` |
| IFRS 9 Reports (parent) | `banking.reports.ifrs9.view` |
| Nominative Report | `banking.reports.ifrs9.nominative.view` |
| Lifetime PD | `banking.reports.ifrs9.lifetime_pd.view` |
| Lifetime LGD | `banking.reports.ifrs9.lifetime_lgd.view` |
| EAD Model | `banking.reports.ifrs9.ead_model.view` |
| ECL Result | `banking.reports.ifrs9.ecl_result.view` |
| ECL Movement | `banking.reports.ifrs9.ecl_movement.view` |
| GCA Movement | `banking.reports.ifrs9.gca_movement.view` |
| Advanced Analytics | `banking.analytics.view` |
| R Analytics | `banking.analytics.r.view` |
| Tools (parent) | `banking.configuration.ifrs9.manage` |
| Maintenance (parent) | `admin.maintenance.access` |
| Approval | `approval.requests.approve` |
| User Management | `admin.users.manage` |
| Access Management | `admin.users.manage` ATAU `admin.roles.manage` |
| Job Monitoring | `jobs.view` ATAU `jobs.manage` |
| Assessment Workspace | `banking.individual` |

---

## Approval Flow — Level Matriks

```
User action (create/update/delete)
    │
    ├── Tidak butuh approval → Eksekusi langsung
    │
    └── Butuh approval
        │
        ├── User hierarchy >= threshold → Self-approve
        │
        └── User hierarchy < threshold
            │
            ├── Level 1 (CHECKER) → approve
            │   └── Level 2 (APPROVER) → approve → EKSEKUSI
            │
            └── reject → DITOLAK
```

Impact level ditentukan dari Business Setting B0031:

| Level | Score | Approvals | SLA | Priority |
|-------|-------|-----------|-----|----------|
| Low | 1-29 | 1 | 24 jam | 5 |
| Medium | 30-59 | 1 | 8 jam | 5 |
| High | 60-79 | 2 | 4 jam | 1 |
| Critical | 80-100 | 2 | 2 jam | 0 |

---

## Catatan Penting

1. **Permission `manage` mencakup create + update + delete + view**, tetapi TIDAK mencakup akses menu. Akses menu butuh `{resource}` (base) atau `{resource}.access` terpisah.
2. **`admin.super_admin` adalah bypass hardcoded** — user dengan permission ini bisa melakukan apapun tanpa dicek permission lain.
3. **Semua legacy aliases** (`VIEW_USERS`, `MANAGE_ROLES`, `MANAGE_SYSTEM`, dll.) sudah dihapus dari database dan kode. Gunakan permission dot-notation.
4. **Approval role** (`approval.role.*`) dan **approval user status** (`approval.user_status.*`) hanya berlaku untuk RBAC — perubahan role dan status user.
5. **Self-approve** bisa diaktifkan via setting, dan membutuhkan permission `approval.requests.self_approve_override` untuk override.
