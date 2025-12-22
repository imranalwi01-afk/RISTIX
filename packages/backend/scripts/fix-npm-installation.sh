# packages/backend/scripts/fix-npm-installation.sh
#!/bin/bash

echo "🔧 SURGICAL NPM INSTALLATION FIX"
echo "=================================="

# Navigate to backend directory
cd ..

echo "📍 Current directory: $(pwd)"

# Step 1: Clean npm cache completely
echo "🧹 Cleaning npm cache..."
npm cache clean --force
npm cache verify

# Step 2: Remove corrupted files
echo "🗑️ Removing corrupted node_modules and lock files..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Step 3: Clear temporary files
echo "🔄 Clearing temporary files..."
rm -rf .npm
rm -rf ~/.npm/_cacache

# Step 4: Verify Node.js version
echo "📋 Node.js version check:"
node --version
npm --version

# Step 5: Install with specific npm configuration
echo "📦 Installing dependencies with fixed configuration..."
npm config set legacy-peer-deps true
npm config set audit false
npm config set fund false

# Step 6: Install dependencies one by one for problematic packages
echo "🎯 Installing critical packages individually..."

# Core Express packages
npm install express@^4.18.2 --no-optional
npm install @types/express@^4.17.21 --save-dev

# UUID packages (the problematic ones)
npm install uuid@^9.0.1 --no-optional
npm install @types/uuid@^9.0.7 --save-dev

# Zod for validation
npm install zod@^3.22.4 --no-optional

# Express rate limit
npm install express-rate-limit@^7.1.5 --no-optional

# Authentication & security
npm install jsonwebtoken@^9.0.2 --no-optional
npm install @types/jsonwebtoken@^9.0.5 --save-dev
npm install bcryptjs@^2.4.3 --no-optional
npm install @types/bcryptjs@^2.4.6 --save-dev

# Logging packages
npm install winston@^3.11.0 --no-optional

# Step 7: Install remaining packages
echo "📥 Installing remaining dependencies..."
npm install --no-optional

# Step 8: Verify installation
echo "✅ Verifying installation..."
npm list --depth=0

# Step 9: Test TypeScript compilation
echo "🔍 Testing TypeScript compilation..."
npx tsc --noEmit

echo "🎉 Installation complete!"
echo "📊 Next steps:"
echo "  1. npm run dev (to start development server)"
echo "  2. Check for any remaining TypeScript errors"