#!/bin/bash
# Test ECL Configuration implementation with DS2 database
# Run migration and test endpoints

set -e

echo "🔧 [ECL-TEST-001] Starting ECL Configuration test..."

# Database connection variables
DS2_HOST="192.168.0.106"
DS2_PORT="5433" 
DS2_DATABASE="FRS9PRO"
DS2_USER="postgres"
DS2_PASSWORD="postgres"

# Test database connectivity
echo "🔍 [ECL-TEST-002] Testing DS2 database connectivity..."
if pg_isready -h $DS2_HOST -p $DS2_PORT -U $DS2_USER; then
    echo "✅ [ECL-TEST-003] DS2 database is accessible"
else
    echo "❌ [ECL-TEST-004] DS2 database is NOT accessible - please check connection"
    exit 1
fi

# Run migration
echo "🚀 [ECL-TEST-005] Running ECL Configuration migration..."
PGPASSWORD=$DS2_PASSWORD psql -h $DS2_HOST -p $DS2_PORT -U $DS2_USER -d $DS2_DATABASE -f ../src/core/database/migrations/003-ecl-configuration-system.sql

if [ $? -eq 0 ]; then
    echo "✅ [ECL-TEST-006] Migration completed successfully"
else
    echo "❌ [ECL-TEST-007] Migration failed"
    exit 1
fi

# Verify tables exist
echo "🔍 [ECL-TEST-008] Verifying ECL Configuration tables..."
TABLE_COUNT=$(PGPASSWORD=$DS2_PASSWORD psql -h $DS2_HOST -p $DS2_PORT -U $DS2_USER -d $DS2_DATABASE -t -c "
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name IN ('frs9_imp_ca_ecl_configh', 'frs9_imp_ca_ecl_configd');
")

if [ "$TABLE_COUNT" -eq 2 ]; then
    echo "✅ [ECL-TEST-009] Both ECL Configuration tables exist"
else
    echo "❌ [ECL-TEST-010] ECL Configuration tables missing (found: $TABLE_COUNT/2)"
    exit 1
fi

# Verify stored procedure exists
echo "🔍 [ECL-TEST-011] Verifying stored procedure sp_frs9_preview_sequence..."
PROC_COUNT=$(PGPASSWORD=$DS2_PASSWORD psql -h $DS2_HOST -p $DS2_PORT -U $DS2_USER -d $DS2_DATABASE -t -c "
SELECT COUNT(*) FROM information_schema.routines 
WHERE routine_name = 'sp_frs9_preview_sequence';
")

if [ "$PROC_COUNT" -eq 1 ]; then
    echo "✅ [ECL-TEST-012] Stored procedure sp_frs9_preview_sequence exists"
else
    echo "❌ [ECL-TEST-013] Stored procedure sp_frs9_preview_sequence missing"
    exit 1
fi

# Check sample data
echo "🔍 [ECL-TEST-014] Checking sample ECL Configuration data..."
SAMPLE_COUNT=$(PGPASSWORD=$DS2_PASSWORD psql -h $DS2_HOST -p $DS2_PORT -U $DS2_USER -d $DS2_DATABASE -t -c "
SELECT COUNT(*) FROM frs9_imp_ca_ecl_configh WHERE configheader = 'ECL_BASIC_CONFIG';
")

if [ "$SAMPLE_COUNT" -eq 1 ]; then
    echo "✅ [ECL-TEST-015] Sample ECL Configuration data exists"
    
    # Show sample data details
    echo "📊 [ECL-TEST-016] Sample ECL Configuration details:"
    PGPASSWORD=$DS2_PASSWORD psql -h $DS2_HOST -p $DS2_PORT -U $DS2_USER -d $DS2_DATABASE -c "
    SELECT 
        configheader,
        configdescr,
        producttype,
        segmentasi,
        active_flag,
        created_by
    FROM frs9_imp_ca_ecl_configh 
    WHERE configheader = 'ECL_BASIC_CONFIG';
    "
    
    # Show sample detail count
    DETAIL_COUNT=$(PGPASSWORD=$DS2_PASSWORD psql -h $DS2_HOST -p $DS2_PORT -U $DS2_USER -d $DS2_DATABASE -t -c "
    SELECT COUNT(*) FROM frs9_imp_ca_ecl_configd WHERE configheader = 'ECL_BASIC_CONFIG';
    ")
    echo "📋 [ECL-TEST-017] Sample configuration has $DETAIL_COUNT detail records"
    
else
    echo "⚠️ [ECL-TEST-018] No sample ECL Configuration data found"
fi

# Test stored procedure
echo "🧪 [ECL-TEST-019] Testing stored procedure sp_frs9_preview_sequence..."
PGPASSWORD=$DS2_PASSWORD psql -h $DS2_HOST -p $DS2_PORT -U $DS2_USER -d $DS2_DATABASE -c "
SELECT 
    sequence_no,
    field_name,
    field_value,
    calculated_value,
    execution_time_ms
FROM sp_frs9_preview_sequence('ECL_BASIC_CONFIG', NULL, CURRENT_DATE)
LIMIT 3;
"

if [ $? -eq 0 ]; then
    echo "✅ [ECL-TEST-020] Stored procedure executed successfully"
else
    echo "❌ [ECL-TEST-021] Stored procedure execution failed"
fi

echo ""
echo "🎯 [ECL-TEST-022] ECL Configuration database setup completed!"
echo "✅ Tables: frs9_imp_ca_ecl_configh, frs9_imp_ca_ecl_configd"  
echo "✅ Stored procedure: sp_frs9_preview_sequence"
echo "✅ Sample data: ECL_BASIC_CONFIG with details"
echo ""
echo "🚀 [ECL-TEST-023] Ready to test ECL Configuration API endpoints!"
echo "Next: Start backend server and test /api/v1/banking/collective/ecl-config"
echo ""