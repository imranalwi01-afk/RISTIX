-- Manual database check for scenarios tables
-- Jalankan query ini di database untuk cek struktur

-- 1. Cek semua tabel dengan nama mirip scenario
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%scenario%'
ORDER BY table_schema, table_name;

-- 2. Cek semua tabel di schema core
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'core'
AND table_name ILIKE '%impairment%'
ORDER BY table_name;

-- 3. Cek semua tabel di database
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
ORDER BY table_schema, table_name;

-- 4. Cek struktur tabel individual_impairment_scenarios jika ada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'individual_impairment_scenarios'
ORDER BY ordinal_position;

-- 5. Cek constraint dan index
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name ILIKE '%scenario%'
ORDER BY table_name;

-- 6. Cek apakah schema core ada
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'core';

-- 7. Cek migration history
SELECT 
    version,
    description,
    installed_on
FROM public.schema_migrations 
ORDER BY installed_on DESC
LIMIT 10;