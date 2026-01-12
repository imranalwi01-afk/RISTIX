# Monorepo Environment Variables Guide

In a monorepo environment (like your setup with `packages/frontend` and `packages/new-backend`), managing `.env` files can be confusing. Here is the recommended "Hybrid Strategy" that balances modularity with orchestration convenience.

## 1. The Strategy: "Scoped Execution, Global Orchestration"

| Context | Recommended Method | Why? |
| :--- | :--- | :--- |
| **Running Services Locally** (`pnpm dev`) | **Per-Package .env** | keeps services independent; strict separation of concerns. |
| **Running Infrastructure** (`docker-compose`) | **Root .env** | Orchestrator needs shared context (e.g. DB credentials used by both DB Container and App Container). |
| **CI/CD Pipelines** | **CI Secrets (GitHub/GitLab)** | Never commit .env files; inject secrets at build time. |

---

## 2. Implementation Details

### A. Per-Package Setup (For Daily Development)
Each package should have its own `.env` (or `.env.local` for Next.js) containing **only** what that specific package needs to run.

**`packages/frontend/.env.local`**
*   Contains: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ANALYTICS_ID`.
*   *Does NOT Contain*: Database passwords, JWT secrets (Frontend shouldn't know these).

**`packages/new-backend/.env`**
*   Contains: `DATABASE_URL`, `JWT_SECRET`, `PORT`.
*   *Does NOT Contain*: React-specific variables.

**Benefits:**
*   **Clarity**: You know exactly what config creates the backend.
*   **Safety**: Impossible to accidentally leak Backend secrets into the Client bundle.

### B. Root Environment (For Docker & Shared Config)
The root `.env` is solely for the **Orchestrator (Docker Compose)**. It does not "cascade" into packages automatically unless you explicitly pass it.

**`/.env`**
*   Contains: `POSTGRES_PASSWORD`, `REDIS_PORT`, `GLOBAL_APP_NAME`, `DEPLOYMENT_ENV`.
*   **Usage**: Used by `docker-compose.yml` to spin up infrastructure with consistent credentials.

---

## 3. How to Handle Duplicate Values?
You will often have `DATABASE_URL` in both root (for Docker) and backend (for local dev). **This is acceptable and preferred.**

*   **Docker (`root/.env`)**: Connection string might use container names (e.g., `postgres:5432`).
*   **Local (`packages/backend/.env`)**: Connection string uses host (e.g., `localhost:5432`).

**Pro Tip: Use `env-cmd` or `dotenv-cli` for shared scripts**
If you have truly shared constants (like `SERVER_PORT=4000`), you can define them in root and inject them:

```json
// root package.json
"scripts": {
  "dev:backend": "env-cmd -f .env pnpm --filter new-backend run dev"
}
```
*However, simpler is usually better: just duplicate the few shared lines to keep packages independent.*

## 4. Summary Checklist

- [ ] **Frontend**: Use `.env.local`. Git-ignore it.
- [ ] **Backend**: Use `.env`. Git-ignore it.
- [ ] **Root**: Use `.env`. Git-ignore it.
- [ ] **Docker**: Reads root `.env`.
- [ ] **Validation**: Use a library like `zod` or `envalid` in each package to crash early if a specific variable is missing.

## 5. Deployment Strategies (Local vs Dev vs Prod)

How you manage these variables changes depending on where the code is running.

### A. Local (Your Machine)
*   **Method**: Manual `.env` files.
*   **Action**: You create `packages/backend/.env` and `packages/frontend/.env.local` manually.
*   **Git**: These files are **ignored** by git.

### B. Dev / Staging (VPS / Docker Host)
*   **Method**: Root `.env` file (Manual or Scripted).
*   **Action**: 
    1. SSH into the VPS.
    2. Create a `.env` file in the project root with staging credentials (e.g. `POSTGRES_PASSWORD=staging_pass`).
    3. Run `docker-compose up`.
*   **Why**: Quick and easy for a single server. You treat the VPS like a "remote local machine".

### C. Production (Cloud / K8s / Serverless)
*   **Method**: Environment Variable Injection (CI/CD).
*   **Action**: 
    *   **Backend**: Set variables in your Platform Dashboard (e.g. Render, Railway, AWS Systems Manager) or inject them via GitHub Actions secrets during build/deploy.
    *   **Frontend**: Set variables in Vercel/Netlify dashboard. **Critical**: These are baked into the static bundle at build time.
*   **File**: There is **NO** `.env` file in production typically. The environment provides the values directly to the process.

**Key Rule**: Never commit secrets. Use the "Injection" method for any environment shared by multiple people (Prod/Staging).

## 6. Copy-Paste Examples

### A. Local Development (`packages/frontend/.env.local`)
```bash
# Connect to Local Backend
NEXT_PUBLIC_API_URL=http://localhost:4232/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:4232
```

### B. Docker Development (`/.env`)
```bash
# Docker Database Credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=dev_password
DB_NAME=ifrspro_platform_admin

# Backend Config (in Docker)
DATABASE_URL=postgresql://postgres:dev_password@postgres:5432/ifrspro_platform_admin
JWT_SECRET=super_secret_jwt_key_dev
```

### C. Production Injection (No File)
*In GitHub Actions or Portainer/Coolify:*

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://user:pass@prod-db-host:5432/db_name` |
| `JWT_SECRET` | `(Generater a Random 64-char string)` |
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
