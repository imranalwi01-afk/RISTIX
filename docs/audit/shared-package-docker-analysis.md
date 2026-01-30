# Shared Package Strategy: Docker Deployment Considerations

## 🐳 Critical Finding: Docker Changes Everything!

### Current Docker Setup

**Your Architecture:**
```yaml
# docker-compose.yml
services:
  new-backend:
    build:
      context: ../../packages/new-backend
      dockerfile: Dockerfile
    volumes:
      - ../../packages/new-backend/src:/app/src:ro  # Hot reload
```

**Key Insight**: Each package builds **independently** in Docker!

## 🚨 Docker Impact on Shared Package

### ❌ MAJOR PROBLEM: Build Context Isolation

**Without Shared Package:**
```dockerfile
# packages/new-backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
COPY src/ ./src/
RUN npm install
RUN npm run build
# ✅ Works! Self-contained
```

**With Shared Package:**
```dockerfile
# packages/new-backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
COPY src/ ./src/
RUN npm install  # ❌ FAILS! Can't find @ifrs9/shared
```

**Why it fails:**
- Docker build context: `packages/new-backend/`
- Shared package location: `packages/shared/`
- **Shared is OUTSIDE build context!**

## 🎯 Solutions for Docker + Shared Package

### Solution 1: Multi-Stage Build from Root (RECOMMENDED)

**Pros:**
- ✅ Works with pnpm workspace
- ✅ Proper dependency resolution
- ✅ Smaller final images

**Cons:**
- ❌ More complex Dockerfile
- ❌ Longer build times
- ❌ Larger build context

**Implementation:**

```dockerfile
# Root Dockerfile for new-backend
FROM node:18-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# ============================================================================
# STAGE 1: Install all dependencies (including shared)
# ============================================================================
FROM base AS deps
COPY packages/shared/package.json ./packages/shared/
COPY packages/new-backend/package.json ./packages/new-backend/

# Install dependencies for workspace
RUN pnpm install --frozen-lockfile

# ============================================================================
# STAGE 2: Build shared package
# ============================================================================
FROM deps AS build-shared
COPY packages/shared ./packages/shared
RUN pnpm --filter @ifrs9/shared build

# ============================================================================
# STAGE 3: Build new-backend
# ============================================================================
FROM build-shared AS build-backend
COPY packages/new-backend ./packages/new-backend
RUN pnpm --filter @ifrs9/new-backend build

# ============================================================================
# STAGE 4: Production image (minimal)
# ============================================================================
FROM node:18-alpine AS production
WORKDIR /app

# Copy built artifacts
COPY --from=build-backend /app/packages/new-backend/dist ./dist
COPY --from=build-backend /app/packages/new-backend/package.json ./
COPY --from=build-shared /app/packages/shared/dist ./node_modules/@ifrs9/shared/dist

# Install production dependencies only
RUN npm install --production

EXPOSE 4232
CMD ["node", "dist/index.js"]
```

**Docker Compose:**
```yaml
services:
  new-backend:
    build:
      context: .  # ← ROOT context!
      dockerfile: Dockerfile.new-backend
    # ...
```

### Solution 2: Copy Shared into Build Context

**Pros:**
- ✅ Simpler Dockerfile
- ✅ Faster builds

**Cons:**
- ❌ Hacky solution
- ❌ Breaks workspace semantics
- ❌ Harder to maintain

**Implementation:**

```dockerfile
# packages/new-backend/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# ❌ HACK: Copy shared package into build context
COPY ../shared ./node_modules/@ifrs9/shared
COPY package.json .
COPY src/ ./src/

RUN npm install
RUN npm run build
```

### Solution 3: Publish Shared to Private Registry

**Pros:**
- ✅ Clean separation
- ✅ Versioned packages
- ✅ Standard npm workflow

**Cons:**
- ❌ Need private registry (Verdaccio, npm private, GitHub packages)
- ❌ Extra deployment step
- ❌ More complex CI/CD

**Implementation:**

```bash
# Publish shared package
cd packages/shared
npm version patch
npm publish --registry https://npm.yourcompany.com

# Use in new-backend
cd packages/new-backend
npm install @ifrs9/shared@latest --registry https://npm.yourcompany.com
```

```dockerfile
# packages/new-backend/Dockerfile
FROM node:18-alpine
WORKDIR /app

# Configure private registry
RUN echo "//npm.yourcompany.com/:_authToken=${NPM_TOKEN}" > .npmrc

COPY package.json .
RUN npm install  # ✅ Works! Fetches from registry
COPY src/ ./src/
RUN npm run build
```

### Solution 4: Build Shared Separately, Copy Artifacts

**Pros:**
- ✅ Clear separation
- ✅ Can cache shared build

**Cons:**
- ❌ Two-step build process
- ❌ Manual coordination

**Implementation:**

```bash
# Step 1: Build shared
docker build -t ifrs9-shared:latest -f packages/shared/Dockerfile packages/shared

# Step 2: Build backend (uses shared image)
docker build -t ifrs9-backend:latest -f packages/new-backend/Dockerfile packages/new-backend
```

```dockerfile
# packages/new-backend/Dockerfile
FROM ifrs9-shared:latest AS shared

FROM node:18-alpine
WORKDIR /app

# Copy shared artifacts
COPY --from=shared /app/dist ./node_modules/@ifrs9/shared/dist

COPY package.json .
COPY src/ ./src/
RUN npm install
RUN npm run build
```

## 📊 Comparison: Docker Solutions

| Solution | Complexity | Build Time | Image Size | Maintainability |
|----------|------------|------------|------------|-----------------|
| **Multi-stage from root** | High | Slow | Small | Good |
| **Copy into context** | Low | Fast | Medium | Poor |
| **Private registry** | Medium | Medium | Small | Excellent |
| **Separate builds** | Medium | Medium | Small | Good |

## 🎯 Recommended Approach for Docker

### **Option A: Multi-Stage Build (Development)**

**Use for:**
- Local development
- CI/CD builds
- When you control the infrastructure

**Structure:**
```
.
├── Dockerfile.new-backend    # Multi-stage build
├── docker-compose.yml        # Uses root context
├── packages/
│   ├── shared/
│   └── new-backend/
└── pnpm-workspace.yaml
```

### **Option B: Private Registry (Production)**

**Use for:**
- Production deployments
- When deploying to cloud (AWS, GCP, Azure)
- When you need versioning

**Workflow:**
```bash
# CI/CD Pipeline
1. Build shared → Publish to registry
2. Build backend → Install from registry
3. Deploy backend image
```

## 🚨 Docker Compose Implications

### Current Setup (No Shared):
```yaml
services:
  new-backend:
    build:
      context: ../../packages/new-backend  # ✅ Works
      dockerfile: Dockerfile
```

### With Shared Package:
```yaml
services:
  new-backend:
    build:
      context: ../..  # ❌ Must use ROOT context!
      dockerfile: Dockerfile.new-backend
    # OR use pre-built image
    image: ifrs9-backend:latest
```

**Impact:**
- ❌ Can't use `packages/new-backend` as context
- ❌ Must use root context
- ❌ Slower builds (larger context)
- ❌ More complex docker-compose

## 💰 Cost Analysis with Docker

### Without Shared Package:

**Build Time:**
- Backend: 2 minutes
- Frontend: 3 minutes
- **Total**: 5 minutes

**Image Size:**
- Backend: 150 MB
- Frontend: 200 MB
- **Total**: 350 MB

**Complexity:**
- Simple Dockerfiles
- Independent builds
- Easy to maintain

### With Shared Package:

**Build Time:**
- Shared: 1 minute
- Backend: 3 minutes (includes shared)
- Frontend: 4 minutes (includes shared)
- **Total**: 8 minutes (+60%)

**Image Size:**
- Shared: 10 MB
- Backend: 160 MB (+10 MB)
- Frontend: 210 MB (+10 MB)
- **Total**: 380 MB (+8.5%)

**Complexity:**
- Complex multi-stage Dockerfiles
- Coordinated builds
- Harder to debug

## 🎯 Updated Recommendation

### **With Docker: RECONSIDER Shared Package**

**New Analysis:**

| Factor | Without Shared | With Shared |
|--------|---------------|-------------|
| **Build Time** | 5 min | 8 min (+60%) |
| **Image Size** | 350 MB | 380 MB (+8.5%) |
| **Dockerfile Complexity** | Simple | Complex |
| **docker-compose** | Simple | Complex |
| **CI/CD** | Simple | Complex |
| **Debugging** | Easy | Hard |

**Verdict**: ⚠️ **Shared package adds significant Docker overhead!**

## 🔄 Alternative: Keep Docker Simple

### **Recommended: Skip Shared Package for Docker**

**Instead:**

**1. Use tRPC (No Docker Impact)**
```typescript
// Backend exports types
export const appRouter = router({ ... });

// Frontend imports types
import type { AppRouter } from '../backend';

// ✅ No shared package
// ✅ No Docker complexity
// ✅ Full type safety
```

**2. Copy-Paste Critical Types**
```typescript
// Each package has its own types
// Copy when needed
// ✅ Simple Docker builds
// ✅ Independent deployments
```

**3. Use OpenAPI + Code Generation**
```yaml
# Backend exports OpenAPI spec
# Frontend generates types from spec
# ✅ Contract-first
# ✅ No shared package
# ✅ Simple Docker
```

## 📋 Final Decision Matrix (With Docker)

| Factor | Weight | Score (1-10) | Weighted |
|--------|--------|--------------|----------|
| Type Safety | 25% | 10 | 2.5 |
| DRY Principle | 20% | 9 | 1.8 |
| **Docker Complexity** | **25%** | **3** | **0.75** |
| Build Time | 15% | 4 | 0.6 |
| Maintenance | 10% | 5 | 0.5 |
| Dev Experience | 5% | 7 | 0.35 |
| **TOTAL** | 100% | - | **6.5/10** |

**Previous Score (No Docker)**: 7.75/10
**New Score (With Docker)**: 6.5/10

**Verdict**: ⚠️ **BORDERLINE** (Score < 7.0)

## 🎯 Final Recommendation (Docker Considered)

### **If Using Docker: SKIP Shared Package**

**Reasons:**
1. ❌ Docker complexity outweighs benefits
2. ❌ 60% longer build times
3. ❌ Complex multi-stage builds
4. ❌ Harder to debug
5. ❌ More complex CI/CD

**Better Alternatives:**
1. ✅ **tRPC** - Type safety without Docker overhead
2. ✅ **OpenAPI** - Contract-first, simple Docker
3. ✅ **Copy-paste** - Simple, works with Docker

### **Exception: Use Shared Package IF:**

✅ You use private npm registry (GitHub Packages, Verdaccio)
✅ You accept 60% longer build times
✅ You have complex CI/CD pipeline
✅ You need strict versioning

## 📝 Conclusion

**Original Recommendation (No Docker):**
- ✅ Create shared package (7.75/10)

**Updated Recommendation (With Docker):**
- ⚠️ **Skip shared package** (6.5/10)
- ✅ Use tRPC instead
- ✅ Keep Docker builds simple

**Docker changes the game!** The complexity and build time overhead make shared packages less attractive in containerized environments.
