# Approval Workflow

## Flow Umum

```
User action (create/update/delete)
    │
    ▼
ApprovalEnforcementGuard
    │
    ├── requiresApproval = false ────► Execute langsung
    │
    └── requiresApproval = true
        │
        ├── user.hierarchy >= minLevel ──► Self-approve (skip)
        │
        └── user.hierarchy < minLevel ──► Create approval request
              │
              ▼
        Approval Request (status: pending)
              │
              ├── Checker review → approve/reject
              │     │
              │     ├── approve → Level 2 (Approver)
              │     │     │
              │     │     ├── approve → EXECUTE action
              │     │     └── reject → CANCELLED
              │     │
              │     └── reject → REJECTED
              │
              └── SLA expired → EXPIRED → action dibatalkan
```

## Impact Level System

Impact level ditentukan oleh konfigurasi **Business Setting B0031** (default):

| Level | Score | Approvals | SLA | Queue Priority |
|-------|-------|-----------|-----|---------------|
| Low | 1-29 | 1 approval | 24 jam | 5 (rendah) |
| Medium | 30-59 | 1 approval | 8 jam | 5 |
| High | 60-79 | 2 approvals | 4 jam | 1 |
| Critical | 80-100 | 2 approvals | 2 jam | 0 (tertinggi) |

### Elevasi Impact

Impact level bisa naik otomatis karena:

1. **Job Type**: `SQL_SP` → minimal High, `SHELL_COMMAND` → minimal Critical
2. **Target Database**: Legacy DB → High
3. **Priority**: CRITICAL → critical, HIGH → high, NORMAL → medium, LOW → low

## Role Hierarchy

Setiap role punya `hierarchy_level` (1-100) dan `max_impact_level` (low/medium/high/critical):

| Level | Role | Max Impact |
|-------|------|-----------|
| 100 | SUPERADMIN | critical |
| 90 | TENANT_ADMIN | critical |
| 80 | BANK_CRO | high |
| 70 | IFRS_MANAGER | high |
| 60 | PORTFOLIO_MANAGER | medium |
| 50 | RISK_ANALYST / CHECKER | medium |
| 40 | DATA_ADMIN | medium |
| 30 | REPORT_ANALYST | low |
| 20 | AUDITOR | low |
| 10 | VIEWER / MAKER | low |

## Approval Matrix

Setiap entity type punya approval matrix yang menentukan berapa level approval:

| Entity Type | Level 1 | Level 2 |
|-------------|---------|---------|
| `parameter` | CHECKER | APPROVER |
| `product_parameter` | CHECKER | APPROVER |
| `journal_parameter` | CHECKER | APPROVER |
| `job` | CHECKER | APPROVER |
| `user` | APPROVER | SUPERADMIN |
| `role` | APPROVER | SUPERADMIN |

## Permission untuk Approval

| Permission | Kegunaan |
|------------|----------|
| `approval.requests.approve` | Menyetujui/menolak request |
| `approval.all` | Override semua batasan approval |
| `approval.requests.self_approve_override` | Self-approve jika diizinkan setting |
| `approval.{entity}.create` | Menyetujui pembuatan entity |
| `approval.{entity}.update` | Menyetujui perubahan entity |
| `approval.{entity}.delete` | Menyetujui penghapusan entity |

## Konfigurasi

Semua threshold bisa diubah via **Business Setting B0031** di `/banking/setup/business`:

| Key | Default | Description |
|-----|---------|-------------|
| `levels.low.approvalsRequired` | 1 | Jumlah approval untuk Low |
| `levels.low.slaHours` | 24 | SLA dalam jam |
| `levels.medium.approvalsRequired` | 1 | |
| `levels.medium.slaHours` | 8 | |
| `levels.high.approvalsRequired` | 2 | |
| `levels.high.slaHours` | 4 | |
| `levels.critical.approvalsRequired` | 2 | |
| `levels.critical.slaHours` | 2 | |
