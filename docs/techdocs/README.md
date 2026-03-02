# Technical Documentation Index

This directory contains consolidated technical documentation, reports, and analysis for the IFRS9 project.

## 📂 Directory Structure

### [Query Specifications](./query-specifications/)
Contains detailed SQL queries and table mapping specifications for various application modules:
- Analytics Dashboards & Reports
- Application Setup & Configuration
- Business Logic & Workflows
- EAD, LGD, and PD setups
- Segmentations and Product Parameters

### [Functional Analysis](./functional-analysis/)
In-depth technical analysis and debugging reports for core features:
- Core Module Analysis (ECL, PD, LGD)
- Database structure and relationship reports
- Feature-specific technical deep-dives (Segmentation, Workflows)

### [Progress Reports](./progress-reports/)
Historical progress tracking and daily logs:
- `laporan_progress_jan_feb_2026.md`
- `laporan_harian_jan_feb_2026.md`

### [Summaries and Fixes](./summaries-and-fixes/)
Post-implementation summaries and detailed fix descriptions:
- Migration and implementation completion reports
- Critical bug fix analyses (Segmentation, Auth, Deletes)

### [Reference](./reference/)
General reference materials and static reports:
- `schema.txt`: Database schema reference
- `SOCKET_IO_CHECKLIST.md`: Real-time notification setup
- `Laporan_Dashboard_IFRS9.pdf`: Visual dashboard report
- `CLEAR_SESSION_INSTRUCTIONS.md`: Maintenance procedures

### [Scripts](../../scripts/)
Utility and maintenance scripts:
- `approve_*`: Approval flow helpers
- `check_*`: Database and state verification
- `debug_*`: Troubleshooting utilities
- `fix_*`: One-off data or config fixes
- `manual_*`: Manual data entry/test helpers
- `run_*`: Seed runners and migration triggers
- `update_*`: Batch update utilities
- Scripts include both `.js`, `.ts`, and `.py` files.

### [Tests](../../tests/)
Automated and manual test suites:
- `test_*`: Core functional tests
- `verify_*`: Final state validation scripts

### [Database SQL](../../database/sql/)
Scattered SQL scripts for data migration and seeding:
- `05_move_ifrs9_to_public_frs9pro.sql`
- `seed_individual_impairment_data.sql`
- `seed_master_account_data.sql`
- `temp_seed_tenant.sql`

### [Logs](../../logs/)
Temporary execution logs and data outputs:
- `api_out.txt`, `backend_logs.txt`, `logs.txt`, `temp.txt`
- `db_output.json`, `inspect_results.json`

---
*Note: The root directory now only contains essential configuration files (`package.json`, `Makefile`, etc.) and primary execution scripts (`.sh`, `.bat`) to keep the workspace clean.*
