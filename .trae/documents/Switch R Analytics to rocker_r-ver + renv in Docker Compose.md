## Why This Is Better
- `rocker/shiny:4.3.2` doesn’t publish an image for all platforms (common on Apple Silicon), which is why you hit the “no match for platform in manifest” error.
- Using `rocker/r-ver:4.3.2` + `shiny::runApp()` avoids needing Shiny Server entirely and gives you a standard R runtime you can fully control.
- Using `renv.lock` makes installs deterministic and speeds up rebuilds because dependency restore is a cached layer.

## Repo Reality Check
- There is currently **no `renv.lock` in this repo**.
- The Shiny app we’re running in Docker is the modular app at [shiny-app](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/r-analytics/shiny-app), which loads heavy deps like `tidyverse`, `ggplot2`, `plotly`, `forecast`, etc. ([global.R](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/r-analytics/shiny-app/global.R)).

## Plan
### 1) Replace the R Analytics Dockerfile to use `rocker/r-ver:4.3.2`
- Rewrite [packages/r-analytics/Dockerfile](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/r-analytics/Dockerfile) to:
  - `FROM rocker/r-ver:4.3.2`
  - Install required system libs for the Shiny app + tidyverse graphics stack (incl. `pkg-config`, `libfreetype6-dev`, `libpng-dev`, `libtiff5-dev`, `libjpeg-dev`, `libwebp-dev`, etc.)
  - Set CRAN to `https://cloud.r-project.org`
  - Install `renv`
  - Copy `renv.lock` first and run `renv::restore()`
  - Copy the app code last
  - Start the app via `Rscript start_iaf.R` (no Shiny Server)
- Remove any baked-in DB password defaults in the image (env vars come from compose).

### 2) Introduce `renv.lock` for the Shiny app
- Create `packages/r-analytics/renv.lock` (or `packages/r-analytics/shiny-app/renv.lock`; we’ll pick one and be consistent).
- Generate it from the packages the app actually uses (from [global.R](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/r-analytics/shiny-app/global.R) and [app.R](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/r-analytics/shiny-app/app.R)).
- Add a minimal `renv` bootstrap (either keep lock-only restore in Docker, or include `renv/activate.R` if you want local R workflows too).

### 3) Keep Docker Compose integration (ops/local)
- Keep the existing `r-analytics` service in [ops/local/docker-compose.yml](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/ops/local/docker-compose.yml), but update build/runtime assumptions for the new image:
  - Ensure port mapping stays `3838:3838`
  - Keep `platform: linux/amd64` for compatibility on Apple Silicon
  - Keep DB env wiring via `R_DB_*` → `DB_*`

### 4) Verify end-to-end
- Build the image.
- `docker-compose ... --profile analytics up --build`.
- Confirm `http://localhost:3838` responds and logs show the app started.

## Result
- You can run R Analytics from `ops/local` with Docker only.
- No local R install required.
- Rebuilds are much faster (renv restore cached).
