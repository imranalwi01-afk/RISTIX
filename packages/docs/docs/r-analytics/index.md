# R-Analytics Service

**Stack:** R, Shiny, Plumber, shell scripts.

## 1. Overview
The R-Analytics package provides the statistical engine for IFRS9 calculations and a dedicated dashboard for detailed model analysis. It operates as a standalone service that integrates with the main platform via API and shared database access.

## 2. Architecture

### Components
*   **Shiny Dashboard**: An interactive web interface (Port 4236) for Risk Managers to visual portfolio performance and run ad-hoc analysis.
    *   Entry point: `shiny-app/app.R`
*   **Plumber API**: Exposes R functions as REST endpoints for the backend to consume.
    *   Entry point: `api/plumber.R` (if applicable) or direct script invocation.
*   **Service Manager**: A robust shell script (`r-analytics-manager.sh`) that controls the lifecycle of the R process.

### Architecture Context: Legacy vs Modern
The codebase currently contains two versions of the analytics engine:

1.  **Legacy (`/modelling`)**: A monolithic structure containing `app34.R`. This is currently used by the root startup scripts (`START_R_ANALYTICS.sh/bat`).
2.  **Modern (`/packages/r-analytics`)**: A modularized, production-ready implementation with proper separation of concerns (UI, Server, Config).

> **Note:** The documentation below refers to the **Modern** implementation in `packages/r-analytics`. We recommend migrating usage to this package for better stability and maintainability.

### Service Architecture
```mermaid
graph TD
    Manager[r-analytics-manager.sh] -->|Start/Stop| Script[start-iaf-analytics.sh]
    Script -->|Launches| R[R Process]
    R -->|Runs| Shiny[Shiny App (Port 4236)]
    R -->|Connects| DB[(IFRS9 Legacy DB)]
```

## 3. Service Management
The service is managed via the `r-analytics-manager.sh` script.

### Common Commands
*   **Start Service**: `./r-analytics-manager.sh start`
*   **Check Status**: `./r-analytics-manager.sh status`
*   **Stop Service**: `./r-analytics-manager.sh stop`
*   **Restart**: `./r-analytics-manager.sh restart`

### Authentication
*   **Enable Auth**: `./r-analytics-manager.sh auth enable`
*   **Disable Auth**: `./r-analytics-manager.sh auth disable` (Dev mode)

## 4. Configuration
Configuration is handled via environment variables and R scripts.
*   **Legacy DB Connection**: Defined in `shiny-app/start_iaf.R` (Host, User, SSL).
*   **Environment**: `.env.iaf` contains service-specific settings.

## 5. Deployment
1.  Ensure R and system dependencies are installed (`install-packages.R`).
2.  Configure `.env.iaf` with the correct Database URL.
3.  Run `./r-analytics-manager.sh start`.
4.  Access the dashboard at `http://localhost:4236`.
