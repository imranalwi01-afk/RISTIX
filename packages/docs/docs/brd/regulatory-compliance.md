# BRD: Regulatory Compliance & Reporting

**Date:** 2026-02-01

## 1. Business Context
The bank is required to comply with IFRS9 (International Financial Reporting Standard 9) for recognizing and measuring financial assets and liabilities. This requires a robust, auditable, and accurate system for calculating Expected Credit Loses (ECL).

## 2. Business Goals
1.  **Regulatory Compliance**: Ensure 100% adherence to local Central Bank and IFRS9 calculation standards.
2.  **Operational Efficiency**: Reduce the manual effort required to run monthly calculations by 50% via automation/scheduling.
3.  **Auditability**: Provide a complete, tamper-proof history of who ran what model and when.

## 3. Business Requirements

### 3.1 Reporting
*   **REQ-001**: System must generate the "PD/LGD/EAD" report format required by the Central Bank.
*   **REQ-002**: Reports must be exportable to Excel and PDF.

### 3.2 Data Lineage
*   **REQ-003**: Every calculation result must be traceable back to the input data snapshot used.
*   **REQ-004**: System must prevent modification of input data once a calculation has been finalized.

### 3.3 Approval Workflow
*   **REQ-005**: All "Critical" priority jobs (e.g., final monthly ECL) must require a "4-eyes" approval (Maker-Checker) before execution.
*   **REQ-006**: The system must enforce role-based access control (RBAC) where only users with `RISK_MANAGER` role can approve jobs.
