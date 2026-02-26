---
title: FSD - Individual Impairment Management
description: Functional specification for individual impairment records, watchlists, and case lifecycle actions.
sidebar_position: 8
---

# FSD: Individual Impairment Management

## 1. Objective
Define business and technical behavior for the individual impairment workflow and supporting data operations.

## 2. Scope
- `/api/v1/banking/individual/impairment`
- `/api/v1/banking/ifrs9/impairment-module`
- related watchlist and staging analysis endpoints

## 3. Actors
- Credit/Risk Analyst
- Supervisor/Approver
- Auditor

## 4. Functional Requirements

### 4.1 Case Intake and Listing
- Users can list individual impairment candidates and active cases.
- Filtering by processing date, segment, stage, status, and search term.
- Pagination and sorting are required for high-volume datasets.

### 4.2 Case Detail Management
- Create/update impairment case details with required financial fields.
- Maintain source references (account/cif/facility) and status fields.
- Validation must reject malformed or incomplete critical inputs.

### 4.3 Watchlist Handling
- Watchlist endpoints provide list and case action capability.
- Must support transition from watchlist to formal impairment process.
- Response includes pagination and stable item identity.

### 4.4 Analytical Views
- Staging and provision summary endpoints expose aggregated outcomes.
- Date-based query options are supported.
- Output schema must remain stable for dashboard usage.

## 5. Compliance and Controls
- All manual override changes must be auditable.
- Permission checks must enforce view/edit separation.
- Sensitive operations can be approval-gated when policy requires.

## 6. Acceptance Criteria
- Case lifecycle actions are reproducible and consistent across endpoints.
- Aggregated analysis endpoints return validated structured payloads.
- Audit trail exists for create/update/delete/override actions.

