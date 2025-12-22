#!/bin/bash
# ============================================================================
# QUICK FIX: D2H5 Scripts Path Issue
# ============================================================================
# This script fixes the PROJECT_ROOT path calculation in all D2H5 scripts
# Run this once to fix all path issues
# ============================================================================

set -e

echo "🔧 Fixing D2H5 Scripts Path Issues..."

# Navigate to the scripts directory
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"
PROJECT_ROOT="$(cd ../../.. && pwd)"

echo "📁 Project root: ${PROJECT_ROOT}"
echo "📁 Script directory: ${SCRIPT_DIR}"

# Fix all D2H5 scripts
for script in d2h5-react-admin-codegen-part*.sh; do
    if [[ -f "$script" ]]; then
        echo "🔧 Fixing $script..."
        
        # Backup original
        cp "$script" "$script.backup"
        
        # Fix the PROJECT_ROOT path calculation
        sed -i 's|PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"|PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"|g' "$script"
        
        echo "✅ Fixed $script"
    fi
done

echo ""
echo "🎉 All D2H5 scripts have been fixed!"
echo "✅ Path calculation updated from '../..' to '../../..'"
echo ""
echo "Now you can run:"
echo "  ./d2h5-react-admin-setup.sh"
