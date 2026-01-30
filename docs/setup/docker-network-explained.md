# Docker Network vs Browser URLs - Explained

## 🤔 The Problem

**Error:**
```
GET http://new-backend:4232/api/v1/auth/login net::ERR_NAME_NOT_RESOLVED
```

## 🎯 Why This Happened

### Docker Network Names vs Browser URLs

**Two Different Contexts:**

1. **Inside Docker** (Container-to-Container):
   - ✅ `new-backend:4232` works
   - Containers can resolve each other by service name
   - Docker's internal DNS handles this

2. **Browser** (Your Mac → Docker):
   - ❌ `new-backend:4232` doesn't work
   - Browser runs on your host machine
   - Can't resolve Docker service names
   - ✅ Needs `localhost:4232`

## 📊 Visual Explanation:

```
┌─────────────────────────────────────────┐
│  Your Mac (Host Machine)                │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Browser                         │  │
│  │  - Needs: localhost:4232         │  │
│  │  - Can't use: new-backend:4232   │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Docker Network: ifrs9-dev       │  │
│  │                                  │  │
│  │  ┌────────────────────────────┐ │  │
│  │  │ frontend-dev container     │ │  │
│  │  │ - Server: Can use both     │ │  │
│  │  │ - Client: Needs localhost  │ │  │
│  │  └────────────────────────────┘ │  │
│  │                                  │  │
│  │  ┌────────────────────────────┐ │  │
│  │  │ new-backend container      │ │  │
│  │  │ - Accessible as:           │ │  │
│  │  │   * new-backend:4232 (Docker)│  │
│  │  │   * localhost:4232 (Host)  │ │  │
│  │  └────────────────────────────┘ │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 🔧 The Fix

### Before (Wrong):
```yaml
# docker-compose.yml
environment:
  - NEXT_PUBLIC_API_URL=http://new-backend:4232/api/v1  # ❌ Browser can't resolve
  - NEXT_PUBLIC_BACKEND_URL=http://new-backend:4232
```

### After (Correct):
```yaml
# docker-compose.yml
environment:
  # Don't override NEXT_PUBLIC_* vars
  # Let .env file provide localhost URLs
  - NODE_ENV=development
  - PORT=4231
```

**Frontend .env file:**
```env
# packages/frontend/.env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4232  # ✅ Browser can resolve
NEXT_PUBLIC_API_BASE_URL=http://localhost:4232/api/v1
```

## 📝 Understanding Next.js Environment Variables

### Server-Side vs Client-Side:

**Server-Side (Next.js Server):**
- Runs inside Docker container
- Can use Docker network names
- Can use `new-backend:4232`

**Client-Side (Browser):**
- Runs on your Mac
- Can't use Docker network names
- Must use `localhost:4232`

### NEXT_PUBLIC_* Variables:

**Key Rule:** `NEXT_PUBLIC_*` variables are **embedded in client-side JavaScript**

```typescript
// This code runs in the BROWSER
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
// Browser needs: http://localhost:4232/api/v1
// Browser can't use: http://new-backend:4232/api/v1
```

## 🎯 Port Mapping

**Docker exposes ports to host:**

```yaml
ports:
  - "4232:4232"  # Host:Container
```

**This means:**
- Inside Docker: `new-backend:4232`
- From host (browser): `localhost:4232`
- **Both point to the same container!**

## ✅ Solution Summary

### What We Did:

1. **Removed Docker env overrides** for `NEXT_PUBLIC_*` variables
2. **Let .env file provide URLs** with `localhost`
3. **Browser now uses correct URLs**

### Why It Works:

```
Browser → localhost:4232 → Docker port mapping → new-backend:4232
```

The port mapping (`4232:4232`) bridges the gap between:
- Host machine (`localhost:4232`)
- Docker network (`new-backend:4232`)

## 🧪 Testing

### From Browser (Your Mac):
```bash
# This works
curl http://localhost:4232/api/v1/health

# This doesn't work
curl http://new-backend:4232/api/v1/health
# Error: Could not resolve host
```

### From Inside Docker Container:
```bash
# Both work!
docker exec ifrs9-frontend-dev-hot curl http://localhost:4232/api/v1/health
docker exec ifrs9-frontend-dev-hot curl http://new-backend:4232/api/v1/health
```

## 📚 Best Practices

### For Docker Development:

**Do:**
- ✅ Use `localhost` in `NEXT_PUBLIC_*` variables
- ✅ Use Docker service names for server-side calls
- ✅ Map ports to host (`4232:4232`)

**Don't:**
- ❌ Use Docker service names in `NEXT_PUBLIC_*` variables
- ❌ Override client-side env vars in docker-compose
- ❌ Expect browser to resolve Docker hostnames

### Environment Variable Strategy:

```env
# .env file (for browser/client-side)
NEXT_PUBLIC_API_URL=http://localhost:4232/api/v1

# docker-compose.yml (for server-side only)
environment:
  - NODE_ENV=development
  # Don't override NEXT_PUBLIC_* here!
```

## 🎉 Result

**Now your browser can connect:**
```
✅ GET http://localhost:4232/api/v1/auth/login
✅ POST http://localhost:4232/api/v1/auth/login
```

**No more `ERR_NAME_NOT_RESOLVED`!** 🚀
