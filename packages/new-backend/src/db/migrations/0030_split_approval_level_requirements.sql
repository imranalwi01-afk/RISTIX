BEGIN;

ALTER TABLE approval.approval_levels
    ADD COLUMN IF NOT EXISTS required_role_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS required_permission_codes JSONB NOT NULL DEFAULT '["approval.requests.approve"]'::jsonb,
    ADD COLUMN IF NOT EXISTS role_match_mode VARCHAR(10) NOT NULL DEFAULT 'ANY',
    ADD COLUMN IF NOT EXISTS permission_match_mode VARCHAR(10) NOT NULL DEFAULT 'ANY';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'approval_levels_role_match_mode_chk'
          AND conrelid = 'approval.approval_levels'::regclass
    ) THEN
        ALTER TABLE approval.approval_levels
            ADD CONSTRAINT approval_levels_role_match_mode_chk
            CHECK (role_match_mode IN ('ANY', 'ALL'));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'approval_levels_permission_match_mode_chk'
          AND conrelid = 'approval.approval_levels'::regclass
    ) THEN
        ALTER TABLE approval.approval_levels
            ADD CONSTRAINT approval_levels_permission_match_mode_chk
            CHECK (permission_match_mode IN ('ANY', 'ALL'));
    END IF;
END
$$;

DO $$
DECLARE
    row_item RECORD;
    role_values TEXT[];
    permission_values TEXT[];
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'approval'
          AND table_name = 'approval_levels'
          AND column_name = 'required_roles'
    ) THEN
        FOR row_item IN
            SELECT id, required_roles, required_role_codes, required_permission_codes
            FROM approval.approval_levels
        LOOP
            role_values := ARRAY[]::TEXT[];
            permission_values := ARRAY[]::TEXT[];

            IF jsonb_typeof(row_item.required_roles) = 'array' THEN
                SELECT ARRAY(
                    SELECT DISTINCT trim(value)
                    FROM jsonb_array_elements_text(row_item.required_roles) value
                    WHERE trim(value) <> ''
                      AND position('.' IN trim(value)) = 0
                ) INTO role_values;

                SELECT ARRAY(
                    SELECT DISTINCT trim(value)
                    FROM jsonb_array_elements_text(row_item.required_roles) value
                    WHERE trim(value) <> ''
                      AND position('.' IN trim(value)) > 0
                ) INTO permission_values;
            END IF;

            UPDATE approval.approval_levels
            SET
                required_role_codes = CASE
                    WHEN jsonb_typeof(row_item.required_role_codes) = 'array'
                         AND jsonb_array_length(row_item.required_role_codes) > 0
                        THEN row_item.required_role_codes
                    ELSE to_jsonb(COALESCE(role_values, ARRAY[]::TEXT[]))
                END,
                required_permission_codes = CASE
                    WHEN jsonb_typeof(row_item.required_permission_codes) = 'array'
                         AND jsonb_array_length(row_item.required_permission_codes) > 0
                        THEN row_item.required_permission_codes
                    WHEN array_length(permission_values, 1) IS NOT NULL
                        THEN to_jsonb(permission_values)
                    ELSE '["approval.requests.approve"]'::jsonb
                END
            WHERE id = row_item.id;
        END LOOP;
    END IF;
END
$$;

ALTER TABLE approval.approval_levels
    DROP COLUMN IF EXISTS required_roles;

COMMIT;
