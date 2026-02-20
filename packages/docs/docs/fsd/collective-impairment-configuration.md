---
title: FSD - Collective Impairment Configuration
description: Functional specification for collective impairment setup including PD, LGD, EAD, ECL, bucket, FL scalar, and rule base.
sidebar_position: 7
---

# FSD: Collective Impairment Configuration

## 1. Objective
Define configuration and lifecycle behavior for collective impairment models and supporting rule engines.

## 2. Scope
- `/api/v1/banking/collective/rule-base`
- `/api/v1/banking/collective/bucket`
- `/api/v1/banking/collective/fl-scalar`
- `/api/v1/banking/collective/pd-configurations`
- `/api/v1/banking/collective/lgd-configurations`
- `/api/v1/banking/collective/ead-configurations`
- `/api/v1/banking/collective/ecl-config`

## 3. Actors
- Model Developer (Maker)
- Model Validator / Approver
- Risk Analyst (Viewer)

## 4. Functional Requirements

### 4.1 Rule Base Settings
- Header-detail rule definitions for scenario and stage behavior.
- Validation for operator/data-type compatibility.
- Rule activation control and sequence ordering.

### 4.2 Bucket Parameters
- Header defines basis and default behavior.
- Details define bucket ranges and IDs.
- Validation must ensure non-overlapping ranges within the same header.

### 4.3 FL Scalar
- CRUD FL scalar configuration with effective usage controls.
- Must support active/inactive state and version-safe updates.

### 4.4 PD/LGD/EAD Model Configurations
- Each model type must support full CRUD and filtering.
- Model linkage fields must be validated against available segments/rules.
- Required model attributes are enforced by schema validation.

### 4.5 ECL Configuration
- ECL header with model metadata and effective date.
- ECL details map to selected PD/LGD/EAD model references.
- Save/update/delete can be approval-gated.

## 5. Approval and Audit
- Model-changing operations can return:
  - `201/200` direct apply
  - `202` pending approval
- All approved and rejected actions must be auditable with before/after data.

## 6. Acceptance Criteria
- Each collective module supports deterministic CRUD behavior.
- Cross-reference validation prevents invalid model combinations.
- Approval and non-approval paths share consistent response envelope.
- Frontend can safely detect `approvalRequired` without transport ambiguity.

