## Goal
Run the R Analytics (port 3838) via `ops/local/docker-compose.yml` so you can start it with Docker and avoid installing R locally.

## What I Found
- `START_R_ANALYTICS.bat` runs `modelling/run_local.R`, which installs packages at runtime and then runs `modelling/app34.R` on port 3838.
- The repo already has an R Analytics container skeleton at [packages/r-analytics/Dockerfile](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/r-analytics/Dockerfile), and a more complete Shiny app under [packages/r-analytics/shiny-app](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/r-analytics/shiny-app).
- The current Dockerfile only copies `shiny-app/*.R` (not subfolders), and the current entrypoint does not start the app. So it needs small fixes to actually run.

## Approach (Recommended)
Use the existing `packages/r-analytics/shiny-app` (started by `Rscript start_iaf.R`) as the containerized R Analytics service. This avoids runtime package installation and matches the repo’s newer R Analytics structure.

## Changes To Implement
1. **Fix the R Analytics image build**
   - Update [packages/r-analytics/Dockerfile](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/r-analytics/Dockerfile) to copy the whole `shiny-app/` directory recursively (not just `*.R`).
   - Ensure the image has `curl` available (Dockerfile healthcheck uses it).
   - Update [packages/r-analytics/docker-entrypoint.sh](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/r-analytics/docker-entrypoint.sh) to default-start the app (e.g., `cd /opt/r-analytics/shiny-app && Rscript start_iaf.R`) when no command is provided.

2. **Add an `r-analytics` service to local compose**
   - Edit [ops/local/docker-compose.yml](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/ops/local/docker-compose.yml) to add a new service:
     - Build from `../../packages/r-analytics`
     - Expose `3838:3838`
     - Join the existing `ifrs9-dev` network
     - Load `ops/local/.env` via `env_file: .env`
     - Set defaults: `R_PORT=3838`, `DEPLOYMENT_TARGET=localdev`, and DB env vars (overridable from `.env`)
     - Add profiles so you can run it via `--profile full` and/or a dedicated `--profile analytics`.

3. **Document the env vars you’ll need**
   - Add an `ops/local/.env.example` (or extend existing docs) showing the variables R Analytics consumes:
     - `R_PORT`
     - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
     - optional: `BANKING_TYPE`, `TENANT_SLUG`, `API_BASE_URL`, etc.
   - This is needed because the repo’s `.env.example` focuses on `DATABASE_URL/LEGACY_DATABASE_URL`, while `start_iaf.R` reads `DB_*`.

## How You’ll Run It
- From repo root:
  - `docker-compose -f ops/local/docker-compose.yml --env-file ops/local/.env --profile analytics up --build`
- Then open:
  - `http://localhost:3838`

## Verification
- Build the image and start the service.
- Confirm container logs show Shiny starting.
- Confirm `http://localhost:3838` returns 200/302.

## Alternative (If you specifically want the exact BAT behavior)
Instead of `packages/r-analytics/shiny-app`, we can create a container that runs `modelling/run_local.R` (and mounts `modelling/`). That will work, but it will be slower because it installs R packages at container start.
