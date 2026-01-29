## Implementation Plan

### 1. Update Native Local Runner Scripts
I will update the shell and batch scripts used for starting R Analytics natively on the host machine.
- **[START_R_ANALYTICS.sh](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/START_R_ANALYTICS.sh)**: Update title and status messages to reflect port `4236`.
- **[START_R_ANALYTICS.bat](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/START_R_ANALYTICS.bat)**: Update title and status messages to reflect port `4236`.

### 2. Update R Entry Point
I will modify the R script that actually launches the Shiny application.
- **[run_local.R](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/modelling/run_local.R)**: Change the `shiny::runApp` port from `3838` to `4236` and update the console messages.

### 3. Update Docker Configuration
I will synchronize the Docker environment to ensure that containerized runs also use the new standard port.
- **[docker-compose.yml](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/ops/local/docker-compose.yml)**: Change `R_PORT` to `4236` and update the port mapping from `3838:3838` to `4236:4236`.
- **[.env](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/ops/local/.env)**: Update any `R_PORT` or `R_ANALYTICS_PORT` variables to `4236`.

## Verification
- Running `START_R_ANALYTICS.sh` (on macOS) or `START_R_ANALYTICS.bat` (on Windows) should now show "Listening on http://0.0.0.0:4236".
- The frontend will now correctly connect to the analytics dashboard without port mismatches.
