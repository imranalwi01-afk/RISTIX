# packages/backend/scripts/diagnose-npm-issue.sh
#!/bin/bash

echo "🔍 NPM INSTALLATION DIAGNOSTIC TOOL"
echo "===================================="

# Navigate to backend directory
cd .. || { echo "❌ Backend directory not found"; exit 1; }

echo "📍 Current directory: $(pwd)"
echo "📅 Timestamp: $(date)"

# System diagnostics
echo ""
echo "🖥️  SYSTEM INFORMATION"
echo "========================"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Operating System: $(uname -a)"
echo "Available memory: $(free -h 2>/dev/null || echo 'N/A')"
echo "Disk space: $(df -h . | tail -1)"

# Package manager detection
echo ""
echo "📦 PACKAGE MANAGER DETECTION"
echo "============================="
if [ -f "pnpm-lock.yaml" ]; then
    echo "⚠️  pnpm-lock.yaml detected - Consider using pnpm instead of npm"
fi

if [ -f "yarn.lock" ]; then
    echo "⚠️  yarn.lock detected - Consider using yarn instead of npm"
fi

if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json found"
    echo "Lock file size: $(ls -lh package-lock.json | awk '{print $5}')"
fi

# Node modules status
echo ""
echo "📁 NODE_MODULES STATUS"
echo "======================"
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
    echo "Size: $(du -sh node_modules | cut -f1)"
    echo "File count: $(find node_modules -type f | wc -l)"
    
    # Check for problematic packages
    echo ""
    echo "🔍 Checking problematic packages:"
    for pkg in uuid zod express-rate-limit; do
        if [ -d "node_modules/$pkg" ]; then
            echo "  ✅ $pkg: installed"
        else
            echo "  ❌ $pkg: missing"
        fi
    done
else
    echo "❌ node_modules directory missing"
fi

# NPM cache status
echo ""
echo "🗂️  NPM CACHE STATUS"
echo "===================="
echo "Cache location: $(npm config get cache)"
echo "Cache size: $(du -sh $(npm config get cache) 2>/dev/null | cut -f1 || echo 'N/A')"

# Package.json validation
echo ""
echo "📋 PACKAGE.JSON VALIDATION"
echo "=========================="
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    
    # Check for syntax errors
    if node -p "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" > /dev/null 2>&1; then
        echo "✅ package.json syntax is valid"
    else
        echo "❌ package.json has syntax errors"
    fi
    
    # Check for duplicate dependencies
    echo ""
    echo "🔍 Checking for duplicate dependencies:"
    if node -p "
        const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
        const deps = Object.keys(pkg.dependencies || {});
        const devDeps = Object.keys(pkg.devDependencies || {});
        const duplicates = deps.filter(dep => devDeps.includes(dep));
        duplicates.length > 0 ? 'Duplicates found: ' + duplicates.join(', ') : 'No duplicates found';
    " 2>/dev/null; then
        echo "  Duplicate check completed"
    else
        echo "  ❌ Error checking duplicates"
    fi
else
    echo "❌ package.json missing"
fi

# NPM configuration
echo ""
echo "⚙️  NPM CONFIGURATION"
echo "====================="
echo "Registry: $(npm config get registry)"
echo "Legacy peer deps: $(npm config get legacy-peer-deps)"
echo "Audit level: $(npm config get audit-level)"
echo "Fund: $(npm config get fund)"

# Try to identify the specific error
echo ""
echo "🚨 ERROR SIMULATION"
echo "==================="
echo "Attempting to reproduce the error..."

# Try npm ls to check for dependency issues
if npm ls --depth=0 > /dev/null 2>&1; then
    echo "✅ npm ls completed successfully"
else
    echo "❌ npm ls failed - dependency tree issues detected"
    npm ls --depth=0 2>&1 | head -20
fi

echo ""
echo "📝 RECOMMENDED ACTIONS"
echo "======================"
echo "1. Run the fix script: ./scripts/fix-npm-installation.sh"
echo "2. If still failing, provide the complete error output"
echo "3. Consider switching to pnpm: npm install -g pnpm && pnpm install"
echo "4. Check disk space and permissions"

echo ""
echo "✅ Diagnostic completed. Review the output above."