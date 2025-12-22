#!/bin/bash
# packages/backend/scripts/fix-pnpm-installation.sh
# ============================================================================
# PNPM INSTALLATION FIX SCRIPT
# ============================================================================
# Your project uses PNPM (detected from .pnpm paths in node_modules)
# This script will properly set up the workspace

echo "🔧 PNPM WORKSPACE INSTALLATION FIX"
echo "==================================="

# Navigate to project root
cd /home/doppelgaenger/ifrspro/ifrs9-platform

echo "📍 Current directory: $(pwd)"

# Step 1: Ensure pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm globally..."
    npm install -g pnpm
else
    echo "✅ pnpm is already installed: $(pnpm --version)"
fi

# Step 2: Clean workspace
echo "🧹 Cleaning workspace..."
rm -rf node_modules
rm -f pnpm-lock.yaml
find packages -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find packages -name "package-lock.json" -delete 2>/dev/null || true

# Step 3: Verify workspace structure
echo "📂 Verifying workspace structure..."
echo "Root package.json:"
if [ -f "package.json" ]; then
    echo "✅ Root package.json exists"
else
    echo "❌ Root package.json missing - creating basic workspace config"
    cat > package.json << 'EOF'
{
  "name": "ifrs9-platform",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "pnpm run dev:backend",
    "dev:backend": "pnpm --filter backend dev",
    "dev:frontend": "pnpm --filter frontend dev",
    "build": "pnpm --filter backend build",
    "install:all": "pnpm install"
  }
}
EOF
fi

# Step 4: Check backend package.json
echo "Backend package.json:"
if [ -f "packages/backend/package.json" ]; then
    echo "✅ Backend package.json exists"
else
    echo "❌ Backend package.json missing - please create it first"
    exit 1
fi

# Step 5: Create pnpm workspace configuration
echo "📋 Creating pnpm workspace configuration..."
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
EOF

# Step 6: Install all dependencies using pnpm
echo "📦 Installing dependencies with pnpm..."
pnpm install

# Step 7: Install backend-specific dependencies if needed
echo "🎯 Installing backend dependencies..."
cd packages/backend
pnpm install

# Step 8: Verify installation
echo "✅ Verifying installation..."
cd /home/doppelgaenger/ifrspro/ifrs9-platform
pnpm list --depth=0

# Step 9: Check backend specifically
echo "🔍 Checking backend installation..."
cd packages/backend
pnpm list --depth=0

echo ""
echo "🎉 PNPM Installation completed!"
echo "📊 Next steps:"
echo "  1. cd packages/backend"
echo "  2. pnpm run dev"
echo "  3. Test authentication endpoint"