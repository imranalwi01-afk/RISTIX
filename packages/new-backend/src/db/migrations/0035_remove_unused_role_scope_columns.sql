-- Remove deprecated role-scope columns after RBAC cleanup.
-- banking_type_specific is no longer used by the API or repository layer.
-- supports_conventional / supports_syariah were legacy flags from older role design.
-- legacy_id is unused in the current RBAC model.

ALTER TABLE core.roles
    DROP COLUMN IF EXISTS banking_type_specific,
    DROP COLUMN IF EXISTS supports_conventional,
    DROP COLUMN IF EXISTS supports_syariah,
    DROP COLUMN IF EXISTS legacy_id;
