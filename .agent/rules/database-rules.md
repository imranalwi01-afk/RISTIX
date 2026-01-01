---
trigger: always_on
---

Rule: Legacy Schema Enforcement All database tables with the prefix frs9_ are part of the legacy system and MUST be defined in the ifrs9 PostgreSQL schema, not the public schema.