---
trigger: always_on
---

Rule: Legacy Schema Enforcement All database tables with the prefix frs9_ are part of the legacy system and MUST be defined in the public schema (using pgTable) and accessed via the legacy database connection (legacyDb).
