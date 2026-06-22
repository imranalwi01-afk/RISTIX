# Database Schema Overview

## Database Architecture

3 database terpisah:

| Database | Fungsi | Schema |
|----------|--------|--------|
| `ifrspro_platform_admin` | Platform-wide config | `platform_admin.*`, `menu.*` |
| `ifrspro_tenant_{slug}` | Per-tenant data | `core.*`, `approval.*`, `audit.*` |
| `FRS9PRO` (Legacy) | IFRS9 engine | `public.frs9_*` |

---

## Platform DB (`ifrspro_platform_admin`)

### `platform_admin.tenants`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `code` | VARCHAR(50) | Tenant code (e.g. 'IAF') |
| `name` | VARCHAR(255) | Tenant name |
| `slug` | VARCHAR(100) | URL slug |
| `banking_mode` | VARCHAR(20) | conventional / dual |
| `is_active` | BOOLEAN | |

### `menu.menu_categories`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | |
| `tenant_id` | UUID | |
| `name` | VARCHAR(100) | Category name (Dashboard, System Setup, etc.) |
| `icon` | VARCHAR(50) | MUI icon name |
| `sort_order` | INTEGER | Display order |

### `menu.menu_items`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | |
| `tenant_id` | UUID | |
| `category_id` | UUID | FK → menu_categories |
| `name` | VARCHAR(100) | Item name |
| `path` | VARCHAR(255) | Route path |
| `icon` | VARCHAR(50) | MUI icon name |
| `parent_id` | UUID | FK → self (nested items) |
| `sort_order` | INTEGER | |

### `platform_admin.settings`
| Column | Type | Description |
|--------|------|-------------|
| `key` | VARCHAR(100) | Setting key (e.g. 'impact_level_config') |
| `value` | JSONB | Setting value |

---

## Tenant DB (`ifrspro_tenant_iaf`)

### `core.users`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | |
| `email` | VARCHAR | Login email |
| `full_name` | VARCHAR | Display name |
| `password_hash` | VARCHAR | Bcrypt hash |
| `tenant_id` | UUID | |

### `core.roles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | |
| `role_code` | VARCHAR(50) | e.g. IAF_VIEWER, IAF_RISK_ANALYST |
| `role_name` | VARCHAR(100) | Display name |
| `hierarchy_level` | INTEGER | 1-100 (higher = more authority) |
| `max_impact_level` | VARCHAR(20) | low/medium/high/critical |
| `is_system_role` | BOOLEAN | Cannot be deleted |

### `core.permissions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | |
| `code` | VARCHAR(100) | e.g. `banking.parameter.product.view` |
| `name` | VARCHAR(255) | Display name |
| `resource` | VARCHAR(100) | Resource group |
| `action` | VARCHAR(50) | view/create/update/delete/manage |
| `module` | VARCHAR(50) | banking / admin / approval |
| `category` | VARCHAR(100) | Grouping category |
| `impact_level` | VARCHAR(20) | low/medium/high/critical |

### `core.role_permissions`
Junction table: role_id ↔ permission_id (with cascade delete)

### `core.user_roles`
Junction table: user_id ↔ role_id

### `core.menu_permissions`
Maps roles to menu items. Stored in tenant DB with FK to `core.roles`.

| Column | Description |
|--------|-------------|
| `menu_item_id` | FK → `menu.menu_items` (Platform DB) |
| `role_id` | FK → `core.roles` (Tenant DB) ON DELETE CASCADE |
| `permission_type` | view / edit / delete / manage |
| `is_allowed` | BOOLEAN |

### `approval.approval_matrices`
| Column | Description |
|--------|-------------|
| `entity_type` | e.g. 'parameter', 'job', 'user' |
| `operation_type` | create / update / delete |

### `approval.approval_levels`
| Column | Description |
|--------|-------------|
| `matrix_id` | FK → approval_matrices |
| `level` | INTEGER (1, 2, 3...) |
| `required_role_codes` | JSONB (e.g. ['CHECKER']) |
| `required_count` | INTEGER |

### `approval.approval_requests`
| Column | Description |
|--------|-------------|
| `entity_type` | e.g. 'product_parameter' |
| `entity_id` | ID of the entity being changed |
| `request_data` | JSONB (before + after values) |
| `status` | pending / approved / rejected |
| `impact_level` | low / medium / high / critical |

### `audit.audit_logs`
| Column | Description |
|--------|-------------|
| `event_type` | e.g. 'data', 'action' |
| `action` | e.g. 'create', 'update', 'delete' |
| `entity_type` | e.g. 'product_parameter' |
| `old_values` / `new_values` | JSONB (before/after snapshots) |

---

## Legacy DB (`FRS9PRO`)

### Master Data

| Table | Description |
|-------|-------------|
| `frs9_master_account` | Main account data (132 cols) — all accounts, contracts, facilities |
| `frs9_account_id` | Account ID mapping |
| `frs9_master_transaction_cost` | Transaction cost/amortization data |

### Configuration

| Table | Description |
|-------|-------------|
| `frs9_param_commonh` | Business settings headers (B0001-B0031) |
| `frs9_param_commond` | Business setting details |
| `frs9_param_product` | Product parameters |
| `frs9_param_journal` | Journal/accounting parameters |
| `frs9_param_segmenth` | Segmentation headers |
| `frs9_param_segmentd` | Segmentation details |
| `frs9_imp_ca_pd_config` | PD Configuration |
| `frs9_imp_ca_lgd_config` | LGD Configuration |
| `frs9_imp_ca_ead_config` | EAD Configuration |
| `frs9_imp_ca_fl_scalarh` | FL Scalar headers |
| `frs9_imp_ca_fl_scalard` | FL Scalar details |
| `frs9_imp_ca_ecl_configh` | ECL Configuration headers |
| `frs9_imp_ca_ecl_configd` | ECL Configuration details |
| `frs9_imp_ca_bucket` | Bucket configuration |

### Result Data

| Table | Description |
|-------|-------------|
| `frs9_imp_ca_result_h` | ECL Result headers (per segment/group) |
| `frs9_imp_ca_result_d` | ECL Result details (per account) |
| `frs9_ecl_summary` | ECL Summary (aggregated, for dashboard) |
| `frs9_imp_ca_lgd_h` | LGD Result headers |
| `frs9_imp_ca_lgd_d` | LGD Result details |
| `frs9_imp_ca_lgd_data` | LGD account-level data |
| `frs9_imp_ia_result_h` | Individual Impairment headers |
| `frs9_imp_ia_result_d` | Individual Impairment details (DCF schedule) |
| `frs9_imp_journal_data` | Journal entries from impairment |
| `frs9_imp_movement_data` | ECL Movement data |
| `frs9_nominative_output` | Nominative report data |
| `frs9_imp_ca_ecl_sum` | ECL calculation summary |

### PD Data

| Table | Description |
|-------|-------------|
| `frs9_imp_ca_pd_odr` | PD ODR (Observed Default Rate) |
| `frs9_imp_ca_pd_ts` | PD Time Series |
| `frs9_imp_ca_pd_structure` | PD Structure |
| `frs9_imp_ca_pd_migration` | PD Migration Matrix |
| `frs9_imp_ca_pd_flowrate` | PD Flow Rate |
| `frs9_r_pd_output_monthly` | R Analytics PD output |

## Relasi Utama

```
frs9_master_account (account_id)
  ├── frs9_imp_ca_result_h (account_id + prc_date)
  ├── frs9_imp_ca_result_d (account_id + prc_date)
  ├── frs9_imp_ia_result_h (account_id + prc_date)
  ├── frs9_imp_journal_data (account_id)
  └── frs9_master_transaction_cost (account_id)
```
