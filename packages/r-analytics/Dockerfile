# packages/r-analytics/Dockerfile
# ============================================================================
# 🐳 R ANALYTICS CONTAINER - MULTI-TENANT ISLAMIC BANKING IFRS9
# ============================================================================
# ✅ OPTIMIZED: Fast build times with cached layers
# ✅ SECURE: Non-root user with minimal attack surface
# ✅ MULTI-TENANT: Environment-based configuration
# ✅ ISLAMIC BANKING: Syariah-compliant analytics support
# ============================================================================

# Use official R base image with Shiny pre-installed
FROM rocker/shiny:4.3.2

# Metadata
LABEL maintainer="IFRS9 Platform Team"
LABEL description="Multi-tenant R Analytics with Islamic Banking support"
LABEL version="1.0.0"

# ============================================================================
# 📦 SYSTEM DEPENDENCIES
# ============================================================================

# Install system dependencies for R packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Database connectivity
    libpq-dev \
    # SSL/TLS support
    libssl-dev \
    libcurl4-openssl-dev \
    libssh2-1-dev \
    # XML processing
    libxml2-dev \
    # Graphics & Plotting
    libcairo2-dev \
    libxt-dev \
    # Image & Font processing (for tidyverse/ggplot2)
    libpng-dev \
    libjpeg-dev \
    libtiff5-dev \
    libfontconfig1-dev \
    libfreetype6-dev \
    libfribidi-dev \
    libharfbuzz-dev \
    # Mathematical libraries & Optimization
    libgsl-dev \
    libfftw3-dev \
    libgmp-dev \
    libmpfr-dev \
    libglpk-dev \
    # Development tools & Libraries
    build-essential \
    git \
    cmake \
    libicu-dev \
    zlib1g-dev \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# 📊 R PACKAGE INSTALLATION
# ============================================================================

# Use all available cores for compilation
# Step 1: Core & DB Connectivity
RUN R -e "options(Ncpus = parallel::detectCores()); \
    install.packages(c('DBI', 'RPostgres', 'jsonlite', 'httr', 'curl', 'xml2'), repos='https://cran.rstudio.com/'); \
    if (!all(c('DBI', 'RPostgres', 'jsonlite', 'httr', 'curl', 'xml2') %in% installed.packages()[,1])) stop('Step 1 failed')"

# Step 2: Data Manipulation (Splitting tidyverse for reliability)
RUN R -e "options(Ncpus = parallel::detectCores()); \
    install.packages(c('dplyr', 'data.table', 'tibble', 'magrittr', 'purrr', 'stringr', 'forcats'), repos='https://cran.rstudio.com/'); \
    if (!all(c('dplyr', 'data.table', 'tibble', 'magrittr') %in% installed.packages()[,1])) stop('Step 2 failed')"

# Step 3: Tidyverse and Time Series
RUN R -e "options(Ncpus = parallel::detectCores()); \
    install.packages(c('tidyverse', 'lubridate', 'date', 'zoo', 'xts'), repos='https://cran.rstudio.com/'); \
    if (!all(c('tidyverse', 'lubridate', 'zoo', 'xts') %in% installed.packages()[,1])) stop('Step 3 failed')"

# Step 4: Statistical Analysis & Tests
RUN R -e "options(Ncpus = parallel::detectCores()); \
    install.packages(c('MASS', 'nortest', 'lmtest', 'car', 'combinat', 'tseries', 'smooth'), repos='https://cran.rstudio.com/'); \
    if (!all(c('MASS', 'nortest', 'lmtest', 'car', 'combinat', 'tseries', 'smooth') %in% installed.packages()[,1])) stop('Step 4 failed')"

# Step 5: Forecasting & Advanced Analytics
RUN R -e "options(Ncpus = parallel::detectCores()); \
    install.packages(c('forecast', 'fpp2', 'aTSA', 'vars', 'urca', 'tsDyn'), repos='https://cran.rstudio.com/'); \
    if (!all(c('forecast', 'fpp2', 'aTSA', 'vars', 'urca', 'tsDyn') %in% installed.packages()[,1])) stop('Step 5 failed')"

# Step 6: Shiny & Visualization
RUN R -e "options(Ncpus = parallel::detectCores()); \
    install.packages(c('shiny', 'shinydashboard', 'shinyWidgets', 'shinycssloaders', 'shinyjs', 'DT', 'ggplot2', 'plotly'), repos='https://cran.rstudio.com/'); \
    if (!all(c('shiny', 'shinydashboard', 'shinyWidgets', 'shinycssloaders', 'shinyjs', 'DT', 'ggplot2', 'plotly') %in% installed.packages()[,1])) stop('Step 6 failed')"

# Step 7: File I/O & Machine Learning
RUN R -e "options(Ncpus = parallel::detectCores()); \
    install.packages(c('openxlsx', 'readxl', 'future', 'future.apply', 'randomForest', 'caret', 'parallel', 'foreach', 'doParallel'), repos='https://cran.rstudio.com/'); \
    if (!all(c('openxlsx', 'readxl', 'future', 'parallel') %in% installed.packages()[,1])) stop('Step 7 failed')"

# ============================================================================
# 👤 USER SETUP (Security best practice)
# ============================================================================

# Create non-root user for running R applications
RUN groupadd -r r-analytics && useradd -r -g r-analytics -d /home/r-analytics -s /bin/bash r-analytics
RUN mkdir -p /home/r-analytics && chown r-analytics:r-analytics /home/r-analytics

# ============================================================================
# 📁 APPLICATION SETUP
# ============================================================================

# Create application directories
RUN mkdir -p /opt/r-analytics/shiny-app \
    /opt/r-analytics/config \
    /opt/r-analytics/functions \
    /opt/r-analytics/logs \
    /opt/r-analytics/temp \
    && chown -R r-analytics:r-analytics /opt/r-analytics

# Set working directory
WORKDIR /opt/r-analytics

# ============================================================================
# 📄 COPY APPLICATION FILES
# ============================================================================

# Copy R application files if they exist
COPY --chown=r-analytics:r-analytics shiny-app/*.R ./shiny-app/

# Copy configuration files if they exist
COPY --chown=r-analytics:r-analytics config/ ./config/
# COPY --chown=r-analytics:r-analytics functions/ ./functions/ # Removed as directory is missing

# Copy startup script
COPY --chown=r-analytics:r-analytics docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# ============================================================================
# 🌐 SHINY SERVER CONFIGURATION
# ============================================================================

# Create custom Shiny server configuration
RUN echo "server { \
    listen 3838 0.0.0.0; \
    location / { \
    app_dir /opt/r-analytics/shiny-app; \
    log_dir /opt/r-analytics/logs; \
    directory_index on; \
    } \
    }" > /etc/shiny-server/shiny-server.conf

# ============================================================================
# 🔧 ENVIRONMENT CONFIGURATION
# ============================================================================

# Set default environment variables
ENV TENANT_SLUG=demo-conventional
ENV BANKING_TYPE=conventional
ENV USER_ID=demo_user
ENV USER_EMAIL=demo@ifrspro.id
ENV BANKING_ACCESS=BOTH
ENV SYARIAH_CERTIFIED=false

# Database connection defaults
ENV DB_HOST=host.docker.internal
ENV DB_PORT=5432
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV FRS9_DB_HOST=192.168.0.106
ENV FRS9_DB_PORT=5433
ENV FRS9_DB_USER=postgres
ENV FRS9_DB_PASSWORD=postgres

# R and Shiny configuration
ENV R_LIBS_USER=/opt/r-analytics/R-libs
ENV SHINY_HOST=0.0.0.0
ENV SHINY_PORT=3838

# Create R library directory
RUN mkdir -p $R_LIBS_USER && chown r-analytics:r-analytics $R_LIBS_USER

# ============================================================================
# 🚀 STARTUP CONFIGURATION
# ============================================================================

# Switch to non-root user
USER r-analytics

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3838/ || exit 1

# Expose Shiny port
EXPOSE 3838

# Volume for logs and temporary files
VOLUME ["/opt/r-analytics/logs", "/opt/r-analytics/temp"]

# Start the application
ENTRYPOINT ["./docker-entrypoint.sh"]