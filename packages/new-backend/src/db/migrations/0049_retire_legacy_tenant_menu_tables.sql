-- Retire the duplicate tenant-local menu model.
-- Canonical tenant menu configuration lives in the platform database under menu.*.
-- This migration archives data in the tenant database before dropping legacy tables.

BEGIN;

CREATE SCHEMA IF NOT EXISTS legacy_archive;

DO $$
DECLARE
    unexpected_dependency text;
BEGIN
    IF to_regclass('core.menu_items') IS NULL
       AND to_regclass('core.menu_categories') IS NULL
       AND to_regclass('core.role_menu_access') IS NULL THEN
        RETURN;
    END IF;

    SELECT string_agg(
        format('%s via %s', conrelid::regclass::text, conname),
        ', '
    )
    INTO unexpected_dependency
    FROM pg_constraint
    WHERE contype = 'f'
      AND confrelid = ANY (ARRAY[
          to_regclass('core.menu_categories'),
          to_regclass('core.menu_items'),
          to_regclass('core.role_menu_access')
      ]::regclass[])
      AND conrelid IS DISTINCT FROM to_regclass('core.menu_items')
      AND conrelid IS DISTINCT FROM to_regclass('core.role_menu_access');

    IF unexpected_dependency IS NOT NULL THEN
        RAISE EXCEPTION
            'Refusing to retire legacy menu tables; unexpected foreign-key dependencies: %',
            unexpected_dependency;
    END IF;

    SELECT string_agg(format('%I.%I', schemaname, viewname), ', ')
    INTO unexpected_dependency
    FROM pg_views
    WHERE definition ~ 'core\.(menu_categories|menu_items|role_menu_access)';

    IF unexpected_dependency IS NOT NULL THEN
        RAISE EXCEPTION
            'Refusing to retire legacy menu tables; dependent views exist: %',
            unexpected_dependency;
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('core.menu_categories') IS NOT NULL
       AND to_regclass('legacy_archive.menu_categories_pre_platform_source') IS NULL THEN
        CREATE TABLE legacy_archive.menu_categories_pre_platform_source AS
        SELECT *, NOW() AS archived_at
        FROM core.menu_categories;
    END IF;

    IF to_regclass('core.menu_items') IS NOT NULL
       AND to_regclass('legacy_archive.menu_items_pre_platform_source') IS NULL THEN
        CREATE TABLE legacy_archive.menu_items_pre_platform_source AS
        SELECT *, NOW() AS archived_at
        FROM core.menu_items;
    END IF;

    IF to_regclass('core.role_menu_access') IS NOT NULL
       AND to_regclass('legacy_archive.role_menu_access_pre_platform_source') IS NULL THEN
        CREATE TABLE legacy_archive.role_menu_access_pre_platform_source AS
        SELECT *, NOW() AS archived_at
        FROM core.role_menu_access;
    END IF;
END $$;

DROP TABLE IF EXISTS core.role_menu_access;
DROP TABLE IF EXISTS core.menu_items;
DROP TABLE IF EXISTS core.menu_categories;

COMMIT;
