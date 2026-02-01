# PRD: IFRS9 Calculation Engine Integration

**Date:** 2026-02-01

## 1. Executive Summary
This document defines the requirements for integrating the new web platform with the existing IFRS9 Calculation Engine. The goal is to allow Risk Managers to trigger complex credit loss calculations from a modern web interface while leveraging the vetted and validated logic residing in the legacy database.

## 2. User Personas
*   **Risk Manager**: Responsible for monthly ECL (Expected Credit Loss) reporting. Needs to run calculations and verify results.
*   **System Admin**: Monitors the health of the calculation jobs and manages database connections.

## 3. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-1 | Risk Manager | Trigger an ECL calculation for a specific portfolio | I can generate the monthly risk report. |
| US-2 | Risk Manager | Select the 'Legacy DB' as a calculation target | The job runs on the validated engine data. |
| US-3 | Risk Manager | View the progress of a calculation job | I know when the results are ready for review. |
| US-4 | Risk Manager | See a clear error message if the calculation fails | I can troubleshoot data issues in the legacy system. |

## 4. Key Features
*   **Hybrid Execution**: Support for executing logic on both modern and legacy infrastructure.
*   **Audit Trail**: Every calculation trigger must be logged with the user ID, timestamp, and parameters used.
*   **Result Capture**: The system must capture the summary output of the legacy SP (e.g., total ECL amount, record count) and store it in the Tenant DB for reporting.

## 5. Non-Functional Requirements
*   **Performance**: The UI must remain responsive even if the backend calculation takes minutes or hours (asynchronous processing).
*   **Security**: Credentials for the Legacy DB must be securely stored and never exposed to the frontend.
