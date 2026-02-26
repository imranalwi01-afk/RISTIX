---
title: FSD - Banking Setup and Parameters
description: Functional specification for application settings, business settings, and core parameter modules.
sidebar_position: 6
---

# FSD: Banking Setup and Parameters

## 1. Objective
Define behavior for configuration modules that drive IFRS9 setup and downstream calculations.

## 2. Scope
- `/api/v1/banking/setup/application`
- `/api/v1/banking/setup/business`
- `/api/v1/banking/parameters/*`:
  - product
  - journal
  - segmentation
  - product segments
  - population segments

## 3. Actors
- Configuration Maker
- Configuration Approver
- Read-only Analyst

## 4. Functional Requirements

### 4.1 Application Settings
- CRUD for global application parameters per tenant.
- Parameters support activation state and audit attributes.
- Sensitive changes may be maker-checker gated.

### 4.2 Business Settings
- CRUD for business dictionary values used by UI controls and rules.
- Metadata endpoints provide table/column/operator/value options for dynamic forms.
- Referential integrity must be enforced for dependent configuration modules.

### 4.3 Product Parameters
- CRUD product-level attributes used in IFRS9 mapping and behavior.
- Validation for required fields (group, type, code, currency, instrument class, active flag).
- Must support list filters and search by code/description.

### 4.4 Journal Parameters
- CRUD journal mapping entries.
- Must support controlled vocab (GL type/code/dbcr) from business settings.
- Validation should prevent duplicate semantic mappings where prohibited.

### 4.5 Segmentation and Segment Metadata
- Header-detail model for segmentation rules.
- Rule detail supports typed operators and value ranges based on selected data type.
- UI metadata endpoints must stay aligned with backend validation.

## 5. Response and Approval Behavior
- Successful write operations return:
  - direct execution: `200/201`
  - approval required: `202`
- Both outcomes must return JSON body with operation status.

## 6. Acceptance Criteria
- Each setup module supports list/create/update/delete with consistent response shape.
- Metadata endpoints are consumable by dynamic UI forms.
- Approval-gated responses are handled without data loss.
- Changes are auditable and tenant-scoped.

