# Frontend Setup - Quick Fix

## 🎯 Issue: Frontend Docker Volume Conflict

The frontend container has a volume mount conflict with pnpm workspace node_modules.

## ✅ Solution: Run Frontend Locally

**This is actually better for development:**
- Faster hot reload
- Better IDE integration
- Easier debugging
- No Docker overhead

### Quick Start (2 commands):

```bash
# 1. Install dependencies (if not already done)
pnpm install

# 2. Run frontend
cd packages/frontend
pnpm dev
```

### Full Setup:

```bash
# From project root
cd /Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf

# Install all dependencies
pnpm install

# Start frontend
cd packages/frontend
pnpm dev

# Frontend will be available at:
# http://localhost:4231
```

### Environment Variables:

The frontend will automatically use:
```
NEXT_PUBLIC_API_URL=http://localhost:4232/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:4232
```

These are configured in `packages/frontend/.env`

## 🚀 Complete Local Development Setup

### Option A: Backend in Docker, Frontend Local (RECOMMENDED)

```bash
# Terminal 1: Start backend + databases in Docker
make local-backend

# Terminal 2: Run frontend locally
cd packages/frontend
pnpm dev
```

**Benefits:**
- ✅ Backend isolated in Docker
- ✅ Frontend runs natively (faster)
- ✅ Best of both worlds

### Option B: Everything Local

```bash
# Terminal 1: Start databases only
make local-db

# Terminal 2: Run backend locally
cd packages/new-backend
bun run dev

# Terminal 3: Run frontend locally
cd packages/frontend
pnpm dev
```

### Option C: Everything in Docker (Not recommended for frontend)

```bash
# Has volume mount issues with pnpm
# Better to use Option A
```

## 📊 Current Working Setup:

**Backend (Docker):**
- ✅ Running: http://localhost:4232
- ✅ All stub routes working
- ✅ Database connected

**Frontend (Local):**
- Run: `cd packages/frontend && pnpm dev`
- Access: http://localhost:4231
- Connects to: http://localhost:4232/api/v1

## 🧪 Test Integration:

```bash
# 1. Ensure backend is running
curl http://localhost:4232/api/v1/health

# 2. Start frontend
cd packages/frontend
pnpm dev

# 3. Open browser
open http://localhost:4231

# 4. Frontend should connect to backend automatically
```

## 📝 Why This Works Better:

**Frontend Local Advantages:**
1. ✅ Faster hot reload (no Docker overhead)
2. ✅ Better IDE integration (TypeScript, linting)
3. ✅ Easier debugging (Chrome DevTools)
4. ✅ No volume mount issues
5. ✅ Native file watching

**Backend Docker Advantages:**
1. ✅ Isolated environment
2. ✅ Consistent across team
3. ✅ Easy database management
4. ✅ Production-like setup

## 🎯 Recommended Workflow:

```bash
# Start backend + databases (once)
make local-backend

# Run frontend (in separate terminal)
cd packages/frontend
pnpm dev

# Both will be available:
# Frontend: http://localhost:4231
# Backend: http://localhost:4232/api/v1
# API Docs: http://localhost:4232/reference
```

## ✅ This is the Standard Setup!

Many development teams run:
- **Backend in Docker** (for consistency)
- **Frontend locally** (for speed)

This is actually the **best practice** for monorepo development! 🚀
