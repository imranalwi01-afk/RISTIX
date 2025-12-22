#!/bin/bash
# scripts/development/build-all.sh
# Build all packages

set -e

echo "🔨 Building all packages..."

# Build in dependency order
echo "📋 Building shared package..."
cd packages/shared && pnpm run build

echo "🔧 Building backend..."
cd ../backend && pnpm run build

echo "📱 Building frontend..."
cd ../frontend && pnpm run build

echo "📈 Building R Analytics..."
cd ../r-analytics && pnpm run build

echo "✅ All packages built successfully!"
