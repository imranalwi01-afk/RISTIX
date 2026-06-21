# Panduan Permission IFRS9 IAF

Dokumentasi lengkap semua permission yang tersedia dan pengaruhnya terhadap menu/button di aplikasi.

---

## ADMINISTRATION

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `admin.maintenance.access` | Maintenance Access | Akses menu maintenance dan halaman terkait | Sidebar → Admin & Maintenance |
| `admin.super_admin` | Super Admin | Akses penuh ke seluruh modul banking dan platform | Semua menu & tombol |
| `admin.system.view` | View System Administration | Lihat menu administrasi sistem | Platform → menu System |
| `admin.system.manage` | Manage System Administration | Kelola pengaturan sistem, konfigurasi platform | Platform → settings, konfigurasi |
| `admin.users.view` | View Users | Lihat daftar users | Maintenance → Users |
| `admin.users.manage` | Manage Users | Buat, ubah, hapus users. Reset password, aktif/nonaktifkan | Maintenance → Users → button Add/Edit/Delete/Reset Password/Toggle |
| `admin.roles.view` | View Roles | Lihat daftar roles | Maintenance → Access Management → tab Roles |
| `admin.roles.create` | Create Roles | Buat role baru | Maintenace → Access Management → button Create Role |
| `admin.roles.manage` | Manage Roles | Ubah, hapus roles, atur permission | Access Management → Edit/Delete Role, Manage Permissions |
| `notifications.view` | View Notifications | Lihat notifikasi | Icon bell di navbar, halaman Notifications |
| `notifications.manage` | Manage Notifications | Kelola notifikasi (tandai baca, hapus) | Dropdown notifikasi, halaman Notifications |
| `notifications.preferences.manage` | Manage Notification Preferences | Atur preferensi notifikasi (mute, quiet hours) | Settings → Notifikasi |
| `jobs.access` | Job Monitoring Access | Akses menu Job Monitoring | Maintenance → Job Monitoring |
| `jobs.view` | View Jobs | Lihat daftar job dan eksekusi | Job Monitoring → tabel Active Jobs & Job History |
| `jobs.create` | Create Jobs | Buat job definition baru | Job Monitoring → button Create Job |
| `jobs.update` | Update Jobs | Ubah job definition | Job Monitoring → Edit Job |
| `jobs.delete` | Delete Jobs | Hapus job definition | Job Monitoring → Delete Job |
| `jobs.run` | Run Jobs | Jalankan job (trigger execution) | Job Monitoring → button Run Now |
| `jobs.control` | Control Jobs | Kontrol job (pause, stop, restart) | Job Monitoring → tombol kontrol |
| `jobs.manage` | Manage Jobs | Kelola penuh job (all of the above) | Semua aksi job |
| `jobs.approve` | Approve Jobs | Setujui job yang butuh approval | Approval workflow untuk jobs |
| `jobs.runtime.view` | View Job Runtime | Lihat diagnosa runtime job aktif | Job Monitoring → detail dialog → Runtime tab |

---

## BANKING_DASHBOARD

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.dashboard.view` | View Dashboard | Lihat halaman dashboard utama | Banking → Dashboard |
| `banking.dashboard.manage` | Manage Dashboard | Kelola widget dan pengaturan dashboard | Dashboard → settings/widget |

---

## BANKING_ANALYTICS

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.analytics.view` | View Advanced Analytics | Lihat menu Advanced Analytics | Sidebar → Advanced Analytics |
| `banking.analytics.r.view` | View R Analytics | Lihat halaman R Analytics | Advanced Analytics → R Analytics |

---

## BANKING_SETUP

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.setup.access` | Access System Setup | Akses menu System Setup | Sidebar → System Setup |
| `banking.setup.application.access` | Access Application Config | Akses halaman Application Configuration | System Setup → Application Configuration |
| `banking.setup.application.view` | View Application Config | Lihat pengaturan aplikasi | Application Configuration → tabel & detail |
| `banking.setup.application.create` | Create Application Config | Buat pengaturan aplikasi baru | Application Configuration → button Add |
| `banking.setup.application.update` | Update Application Config | Ubah pengaturan aplikasi | Application Configuration → button Edit |
| `banking.setup.application.delete` | Delete Application Config | Hapus pengaturan aplikasi | Application Configuration → button Delete |
| `banking.setup.application.manage` | Manage Application Config | Kelola penuh pengaturan aplikasi | Semua aksi Application Config |
| `banking.setup.business.access` | Access Business Config | Akses halaman Business Configuration | System Setup → Business Configuration |
| `banking.setup.business.view` | View Business Config | Lihat pengaturan bisnis | Business Configuration → tabel & detail |
| `banking.setup.business.create` | Create Business Config | Buat pengaturan bisnis baru | Business Configuration → button Add |
| `banking.setup.business.update` | Update Business Config | Ubah pengaturan bisnis | Business Configuration → button Edit |
| `banking.setup.business.delete` | Delete Business Config | Hapus pengaturan bisnis | Business Configuration → button Delete |
| `banking.setup.business.manage` | Manage Business Config | Kelola penuh pengaturan bisnis | Semua aksi Business Config |

---

## BANKING_PARAMETER

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.parameter.access` | Access Parameter Management | Akses menu Parameter Management | Sidebar → Parameter Management |
| `banking.parameter.view` | View Parameters | Lihat daftar parameter | Parameter Management |
| `banking.parameter.product.access` | Access Product Parameters | Akses halaman Product Parameters | Parameter Management → Product Parameters |
| `banking.parameter.product.view` | View Product Parameters | Lihat daftar product parameter | Product Parameters → tabel |
| `banking.parameter.product.create` | Create Product Parameters | Buat product parameter baru | Product Parameters → button Add |
| `banking.parameter.product.update` | Update Product Parameters | Ubah product parameter | Product Parameters → button Edit |
| `banking.parameter.product.delete` | Delete Product Parameters | Hapus product parameter | Product Parameters → button Delete |
| `banking.parameter.product.manage` | Manage Product Parameters | Kelola penuh product parameter | Semua aksi Product Parameters |
| `banking.parameter.product.export` | Export Product Parameters | Ekspor data product parameter | Product Parameters → button Export |
| `banking.parameter.journal.access` | Access Journal Parameters | Akses halaman Accounting Parameters | Parameter Management → Accounting Parameters |
| `banking.parameter.journal.view` | View Journal Parameters | Lihat daftar journal parameter | Accounting Parameters → tabel |
| `banking.parameter.journal.create` | Create Journal Parameters | Buat journal parameter baru | Accounting Parameters → button Add |
| `banking.parameter.journal.update` | Update Journal Parameters | Ubah journal parameter | Accounting Parameters → button Edit |
| `banking.parameter.journal.delete` | Delete Journal Parameters | Hapus journal parameter | Accounting Parameters → button Delete |
| `banking.parameter.journal.manage` | Manage Journal Parameters | Kelola penuh journal parameter | Semua aksi Accounting Parameters |
| `banking.parameter.journal.export` | Export Journal Parameters | Ekspor data journal parameter | Accounting Parameters → button Export |
| `banking.parameter.segmentation.access` | Access Segmentation Config | Akses halaman Segmentation Configuration | Parameter Management → Segmentation |
| `banking.parameter.segmentation.view` | View Segmentation | Lihat daftar segmentasi | Segmentation → tabel |
| `banking.parameter.segmentation.create` | Create Segmentation | Buat segmentasi baru | Segmentation → button Add |
| `banking.parameter.segmentation.update` | Update Segmentation | Ubah segmentasi | Segmentation → button Edit |
| `banking.parameter.segmentation.delete` | Delete Segmentation | Hapus segmentasi | Segmentation → button Delete |
| `banking.parameter.segmentation.manage` | Manage Segmentation | Kelola penuh segmentasi | Semua aksi Segmentation |
| `banking.parameter.segmentation.export` | Export Segmentation | Ekspor data segmentasi | Segmentation → button Export |

---

## BANKING_COLLECTIVE

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.collective.access` | Access Collective Impairment | Akses menu Collective Impairment | Sidebar → Collective Impairment |
| `banking.collective.view` | View Collective | Lihat halaman collective impairment | Collective Impairment |
| `banking.collective.manage` | Manage Collective | Kelola penuh collective impairment | Semua halaman collective |
| `banking.collective.rule_base.access` | Access Rule Base Setting | Akses halaman Rule Base Setting | Collective → Rule Base Setting |
| `banking.collective.rule_base.view` | View Rule Base | Lihat daftar rule base | Rule Base → tabel |
| `banking.collective.rule_base.create` | Create Rule Base | Buat rule header & detail baru | Rule Base → button Add |
| `banking.collective.rule_base.update` | Update Rule Base | Ubah rule header & detail | Rule Base → button Edit |
| `banking.collective.rule_base.delete` | Delete Rule Base | Hapus rule header & detail | Rule Base → button Delete |
| `banking.collective.rule_base.manage` | Manage Rule Base | Kelola penuh rule base | Semua aksi Rule Base |
| `banking.collective.bucket.access` | Access Bucket Parameter | Akses halaman Bucket Parameter | Collective → Bucket Parameter |
| `banking.collective.bucket.view` | View Bucket | Lihat daftar bucket | Bucket → tabel |
| `banking.collective.bucket.create` | Create Bucket | Buat bucket baru | Bucket → button Add |
| `banking.collective.bucket.update` | Update Bucket | Ubah bucket | Bucket → button Edit |
| `banking.collective.bucket.delete` | Delete Bucket | Hapus bucket | Bucket → button Delete |
| `banking.collective.bucket.manage` | Manage Bucket | Kelola penuh bucket | Semua aksi Bucket |
| `banking.collective.pd.access` | Access PD Setup | Akses halaman PD Setup | Collective → PD Setup |
| `banking.collective.pd.view` | View PD | Lihat daftar PD configuration | PD Setup → tabel |
| `banking.collective.pd_setup.view` | View PD Setup | Lihat detail PD setup | PD Setup → detail |
| `banking.collective.pd.create` | Create PD | Buat PD configuration baru | PD Setup → button Add Configuration |
| `banking.collective.pd.update` | Update PD | Ubah PD configuration | PD Setup → button Edit |
| `banking.collective.pd.delete` | Delete PD | Hapus PD configuration | PD Setup → button Delete |
| `banking.collective.pd.manage` | Manage PD | Kelola penuh PD configuration | Semua aksi PD Setup |
| `banking.collective.lgd.access` | Access LGD Setup | Akses halaman LGD Setup | Collective → LGD Setup |
| `banking.collective.lgd.view` | View LGD | Lihat daftar LGD configuration | LGD Setup → tabel |
| `banking.collective.lgd_setup.view` | View LGD Setup | Lihat detail LGD setup | LGD Setup → detail |
| `banking.collective.lgd.create` | Create LGD | Buat LGD configuration baru | LGD Setup → button Add Configuration |
| `banking.collective.lgd.update` | Update LGD | Ubah LGD configuration | LGD Setup → button Edit |
| `banking.collective.lgd.delete` | Delete LGD | Hapus LGD configuration | LGD Setup → button Delete |
| `banking.collective.lgd.manage` | Manage LGD | Kelola penuh LGD configuration | Semua aksi LGD Setup |
| `banking.collective.ead.access` | Access EAD Setup | Akses halaman EAD Setup | Collective → EAD Setup |
| `banking.collective.ead.view` | View EAD | Lihat daftar EAD configuration | EAD Setup → tabel |
| `banking.collective.ead_setup.view` | View EAD Setup | Lihat detail EAD setup | EAD Setup → detail |
| `banking.collective.ead.create` | Create EAD | Buat EAD configuration baru | EAD Setup → button Add Configuration |
| `banking.collective.ead.update` | Update EAD | Ubah EAD configuration | EAD Setup → button Edit |
| `banking.collective.ead.delete` | Delete EAD | Hapus EAD configuration | EAD Setup → button Delete |
| `banking.collective.ead.manage` | Manage EAD | Kelola penuh EAD configuration | Semua aksi EAD Setup |
| `banking.collective.ecl.access` | Access ECL Config | Akses halaman ECL Configuration | Collective → ECL Configuration |
| `banking.collective.ecl.view` | View ECL Config | Lihat daftar ECL configuration | ECL Config → tabel |
| `banking.collective.ecl.create` | Create ECL Config | Buat ECL configuration baru | ECL Config → button Add |
| `banking.collective.ecl.update` | Update ECL Config | Ubah ECL configuration | ECL Config → button Edit |
| `banking.collective.ecl.delete` | Delete ECL Config | Hapus ECL configuration | ECL Config → button Delete |
| `banking.collective.ecl.manage` | Manage ECL Config | Kelola penuh ECL configuration | Semua aksi ECL Config |
| `banking.collective.fl_scalar.access` | Access FL Scalar | Akses halaman FL Scalar | Collective → FL Scalar |
| `banking.collective.fl_scalar.view` | View FL Scalar | Lihat daftar FL Scalar | FL Scalar → tabel |
| `banking.collective.fl_scalar.create` | Create FL Scalar | Buat FL Scalar baru | FL Scalar → button Add |
| `banking.collective.fl_scalar.update` | Update FL Scalar | Ubah FL Scalar | FL Scalar → button Edit |
| `banking.collective.fl_scalar.delete` | Delete FL Scalar | Hapus FL Scalar | FL Scalar → button Delete |
| `banking.collective.fl_scalar.manage` | Manage FL Scalar | Kelola penuh FL Scalar | Semua aksi FL Scalar |

---

## BANKING_INDIVIDUAL

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.individual.access` | Access Individual Impairment | Akses menu Individual Impairment | Sidebar → Individual Impairment |
| `banking.individual.view` | View Individual | Lihat halaman individual impairment | Individual Impairment |
| `banking.individual.create` | Create Individual | Buat assessment/impairment individual baru | Individual → button Add |
| `banking.individual.manage` | Manage Individual | Kelola penuh individual impairment | Semua aksi Individual |
| `banking.individual.export` | Export Individual | Ekspor data individual impairment | Individual → button Export |
| `banking.individual.approve` | Approve Individual | Setujui perubahan individual impairment | Approval workflow Individual |

---

## BANKING_PROCESSING

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.processing.access` | Access IFRS 9 Processing | Akses menu IFRS 9 Processing | Sidebar → IFRS 9 Processing |
| `banking.processing.view` | View Processing | Lihat halaman processing | IFRS 9 Processing |
| `banking.processing.manage` | Manage Processing | Kelola penuh processing (run calculation, dll) | Processing → button Run, dll |
| `banking.processing.impairment.access` | Access Impairment Module | Akses halaman Impairment Module | Processing → Impairment Module |
| `banking.processing.impairment.view` | View Impairment Module | Lihat data impairment module | Impairment Module → tabel |
| `banking.processing.impairment.manage` | Manage Impairment Module | Kelola penuh impairment module | Semua aksi Impairment Module |
| `banking.processing.amortization.access` | Access Amortization Module | Akses halaman Amortization Module | Processing → Amortization Module |
| `banking.processing.amortization.view` | View Amortization Module | Lihat data amortization module | Amortization Module → tabel |
| `banking.processing.amortization.manage` | Manage Amortization Module | Kelola penuh amortization module | Semua aksi Amortization Module |

---

## BANKING_REPORTS

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.reports.ifrs9.access` | Access IFRS 9 Reports | Akses menu IFRS 9 Reports | Sidebar → IFRS 9 Reports |
| `banking.reports.ifrs9.view` | View IFRS 9 Reports | Lihat halaman reports | IFRS 9 Reports |
| `banking.reports.ifrs9.manage` | Manage IFRS 9 Reports | Kelola pengaturan report | Reports → settings |
| `banking.reports.ifrs9.export` | Export IFRS 9 Reports | Ekspor data report | Reports → button Export |
| `banking.reports.ifrs9.nominative.access` | Access Nominative Report | Akses halaman Nominative Report | Reports → Nominative Report |
| `banking.reports.ifrs9.nominative.view` | View Nominative Report | Lihat data nominative report | Nominative Report → tabel & detail |
| `banking.reports.ifrs9.lifetime_pd.access` | Access Lifetime PD Report | Akses halaman Lifetime PD Report | Reports → Lifetime PD |
| `banking.reports.ifrs9.lifetime_pd.view` | View Lifetime PD Report | Lihat data lifetime PD | Lifetime PD → tabel & chart |
| `banking.reports.ifrs9.lifetime_lgd.access` | Access Lifetime LGD Report | Akses halaman Lifetime LGD Report | Reports → Lifetime LGD |
| `banking.reports.ifrs9.lifetime_lgd.view` | View Lifetime LGD Report | Lihat data lifetime LGD | Lifetime LGD → tabel & chart |
| `banking.reports.ifrs9.ead_model.access` | Access EAD Model Report | Akses halaman EAD Model Report | Reports → EAD Model |
| `banking.reports.ifrs9.ead_model.view` | View EAD Model Report | Lihat data EAD model | EAD Model → tabel & chart |
| `banking.reports.ifrs9.ecl_result.access` | Access ECL Result Report | Akses halaman ECL Result Report | Reports → ECL Result |
| `banking.reports.ifrs9.ecl_result.view` | View ECL Result Report | Lihat data ECL result | ECL Result → tabel, chart, KPI cards |
| `banking.reports.ifrs9.ecl_movement.access` | Access ECL Movement Report | Akses halaman ECL Movement Report | Reports → ECL Movement |
| `banking.reports.ifrs9.ecl_movement.view` | View ECL Movement Report | Lihat data ECL movement | ECL Movement → tabel |
| `banking.reports.ifrs9.gca_movement.access` | Access GCA Movement Report | Akses halaman GCA Movement Report | Reports → GCA Movement |
| `banking.reports.ifrs9.gca_movement.view` | View GCA Movement Report | Lihat data GCA movement | GCA Movement → tabel |

---

## BANKING_CONFIGURATION

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.configuration.ifrs9.access` | IFRS 9 Tools Access | Akses menu Tools dan utilities IFRS 9 | Sidebar → Tools |
| `banking.configuration.ifrs9.manage` | Manage IFRS 9 Tools | Kelola tools dan akses menu IFRS 9 | Tools → settings |

---

## BANKING_TOOLS

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `banking.tools.manage` | Manage Tools | Kelola banking tools dan utilities | Tools → semua submenu |
| `banking.tools.upload.view` | View Manual Upload | Lihat halaman Manual Upload | Tools → Manual Upload |
| `banking.tools.upload.create` | Create Upload | Upload file baru | Manual Upload → button Upload |
| `banking.tools.upload.manage` | Manage Upload | Kelola file upload (hapus, dll) | Manual Upload → button Delete |
| `banking.tools.export.view` | View Data Export | Lihat halaman Data Export | Tools → Data Export |
| `banking.tools.export.manage` | Manage Export | Kelola export data | Data Export → semua aksi |
| `banking.tools.etl.view` | View ETL Tools | Lihat halaman ETL Tools | Tools → ETL Tools |
| `banking.tools.etl.create` | Create ETL | Buat job ETL baru | ETL Tools → button Add |
| `banking.tools.etl.update` | Update ETL | Ubah konfigurasi ETL | ETL Tools → button Edit |
| `banking.tools.etl.run` | Run ETL | Jalankan proses ETL | ETL Tools → button Run |
| `banking.tools.etl.manage` | Manage ETL | Kelola penuh ETL tools | Semua aksi ETL |

---

## WORKFLOW (Approval)

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) | Menu / Tombol |
|----------------|------|------------------------------|---------------|
| `approval.requests.approve` | Approve Requests | Review dan setujui pending approval requests | Maintenance → Approval → button Approve/Reject |
| `approval.all` | Approval Override | Bypass batasan approval (override) | Approval → bypass restrictions |
| `approval.requests.self_approve_override` | Self-Approval Override | Setujui request sendiri jika diizinkan oleh setting | Approval → self-approve |

### Approval Operations (Approve Create/Update/Delete)

| Kode Permission | Nama | Deskripsi (Bahasa Indonesia) |
|----------------|------|------------------------------|
| `approval.user.create` | Approve User Creation | Setujui pembuatan user baru |
| `approval.user.update` | Approve User Updates | Setujui perubahan data user |
| `approval.user.delete` | Approve User Deletion | Setujui penghapusan user |
| `approval.configuration.create` | Approve Config Creation | Setujui pembuatan konfigurasi baru |
| `approval.configuration.update` | Approve Config Updates | Setujui perubahan konfigurasi |
| `approval.configuration.delete` | Approve Config Deletion | Setujui penghapusan konfigurasi |
| `approval.parameter.create` | Approve Parameter Creation | Setujui pembuatan parameter baru |
| `approval.parameter.update` | Approve Parameter Updates | Setujui perubahan parameter |
| `approval.parameter.delete` | Approve Parameter Deletion | Setujui penghapusan parameter |
| `approval.product_parameter.create` | Approve Product Parameter | Setujui pembuatan product parameter |
| `approval.product_parameter.update` | Approve Product Parameter | Setujui perubahan product parameter |
| `approval.product_parameter.delete` | Approve Product Parameter | Setujui penghapusan product parameter |
| `approval.journal_parameter.create` | Approve Journal Parameter | Setujui pembuatan journal parameter |
| `approval.journal_parameter.update` | Approve Journal Parameter | Setujui perubahan journal parameter |
| `approval.journal_parameter.delete` | Approve Journal Parameter | Setujui penghapusan journal parameter |
| `approval.segmentation.create` | Approve Segmentation | Setujui pembuatan segmentasi baru |
| `approval.segmentation.update` | Approve Segmentation | Setujui perubahan segmentasi |
| `approval.segmentation.delete` | Approve Segmentation | Setujui penghapusan segmentasi |
| `approval.rule_base_setting.create` | Approve Rule Base | Setujui pembuatan rule base baru |
| `approval.rule_base_setting.update` | Approve Rule Base | Setujui perubahan rule base |
| `approval.rule_base_setting.delete` | Approve Rule Base | Setujui penghapusan rule base |
| `approval.bucket_parameter.create` | Approve Bucket | Setujui pembuatan bucket baru |
| `approval.bucket_parameter.update` | Approve Bucket | Setujui perubahan bucket |
| `approval.bucket_parameter.delete` | Approve Bucket | Setujui penghapusan bucket |
| `approval.pd_configuration.create` | Approve PD Config | Setujui pembuatan PD configuration |
| `approval.pd_configuration.update` | Approve PD Config | Setujui perubahan PD configuration |
| `approval.pd_configuration.delete` | Approve PD Config | Setujui penghapusan PD configuration |
| `approval.lgd_configuration.create` | Approve LGD Config | Setujui pembuatan LGD configuration |
| `approval.lgd_configuration.update` | Approve LGD Config | Setujui perubahan LGD configuration |
| `approval.lgd_configuration.delete` | Approve LGD Config | Setujui penghapusan LGD configuration |
| `approval.ead_configuration.create` | Approve EAD Config | Setujui pembuatan EAD configuration |
| `approval.ead_configuration.update` | Approve EAD Config | Setujui perubahan EAD configuration |
| `approval.ead_configuration.delete` | Approve EAD Config | Setujui penghapusan EAD configuration |
| `approval.ecl_configuration.create` | Approve ECL Config | Setujui pembuatan ECL configuration |
| `approval.ecl_configuration.update` | Approve ECL Config | Setujui perubahan ECL configuration |
| `approval.ecl_configuration.delete` | Approve ECL Config | Setujui penghapusan ECL configuration |
| `approval.fl_scalar.create` | Approve FL Scalar | Setujui pembuatan FL Scalar baru |
| `approval.fl_scalar.update` | Approve FL Scalar | Setujui perubahan FL Scalar |
| `approval.fl_scalar.delete` | Approve FL Scalar | Setujui penghapusan FL Scalar |

---

## Pola Permission

Setiap resource biasanya memiliki permission dengan pola:

| Action | Prefix | Contoh |
|--------|--------|--------|
| **Akses menu** | `{resource}.access` atau `{resource}` | `banking.parameter.product.access` |
| **Lihat data** | `{resource}.view` | `banking.parameter.product.view` |
| **Buat baru** | `{resource}.create` | `banking.parameter.product.create` |
| **Ubah** | `{resource}.update` | `banking.parameter.product.update` |
| **Hapus** | `{resource}.delete` | `banking.parameter.product.delete` |
| **Kelola** | `{resource}.manage` | `banking.parameter.product.manage` |
| **Ekspor** | `{resource}.export` | `banking.parameter.product.export` |
| **Setujui** | `{resource}.approve` | `approval.requests.approve` |

> **Catatan:** Permission `manage` mencakup semua aksi di bawahnya (view + create + update + delete).
