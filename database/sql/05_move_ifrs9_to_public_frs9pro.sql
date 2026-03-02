-- Script to move all objects from 'ifrs9' schema to 'public' schema
-- Target Database: FRS9PRO
-- Author: Gemini Code Assist

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Check if schema ifrs9 exists
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'ifrs9') THEN
        RAISE NOTICE 'Found ifrs9 schema. Starting migration to public...';
        
        -- 1. Move Tables
        FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'ifrs9' AND table_type = 'BASE TABLE') LOOP
            BEGIN
                EXECUTE 'ALTER TABLE ifrs9.' || quote_ident(r.table_name) || ' SET SCHEMA public';
                RAISE NOTICE 'Moved table % to public', r.table_name;
            EXCEPTION WHEN duplicate_table THEN
                RAISE NOTICE 'Table % already exists in public. Skipping move.', r.table_name;
            END;
        END LOOP;

        -- 2. Move Views
        FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'ifrs9' AND table_type = 'VIEW') LOOP
            BEGIN
                EXECUTE 'ALTER VIEW ifrs9.' || quote_ident(r.table_name) || ' SET SCHEMA public';
                RAISE NOTICE 'Moved view % to public', r.table_name;
            EXCEPTION WHEN duplicate_table THEN
                RAISE NOTICE 'View % already exists in public. Skipping move.', r.table_name;
            END;
        END LOOP;
        
        -- 3. Move Sequences
        FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'ifrs9') LOOP
            BEGIN
                EXECUTE 'ALTER SEQUENCE ifrs9.' || quote_ident(r.sequence_name) || ' SET SCHEMA public';
                RAISE NOTICE 'Moved sequence % to public', r.sequence_name;
            EXCEPTION WHEN duplicate_table THEN
                RAISE NOTICE 'Sequence % already exists in public. Skipping move.', r.sequence_name;
            END;
        END LOOP;

        -- 4. Drop Schema if empty
        BEGIN
            DROP SCHEMA ifrs9;
            RAISE NOTICE 'Schema ifrs9 dropped successfully (migration complete).';
        EXCEPTION WHEN dependent_objects_still_exist THEN
            RAISE NOTICE 'Schema ifrs9 is not empty (some objects could not be moved). Schema retained.';
        END;
    ELSE
        RAISE NOTICE 'Schema ifrs9 does not exist. Migration already completed.';
    END IF;
END $$;