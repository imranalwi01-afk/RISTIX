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
RUN apt-get update && apt-get install -y \
    # Database connectivity
    libpq-dev \
    # SSL/TLS support
    libssl-dev \
    libcurl4-openssl-dev \
    # XML processing
    libxml2-dev \
    # Image processing
    libpng-dev \
    libjpeg-dev \
    # Mathematical libraries
    libgsl-dev \
    libfftw3-dev \
    # Development tools
    build-essential \
    git \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# 📊 R PACKAGE INSTALLATION
# ============================================================================

# Install R packages in optimal order (dependencies first)
RUN R -e "install.packages(c( \
    # Database connectivity
    'DBI', 'RPostgres', \
    # Data manipulation
    'dplyr', 'data.table', 'tibble', 'tidyverse', \
    # Statistical analysis
    'forecast', 'tseries', 'smooth', 'fpp2', 'aTSA', 'MASS', 'nortest', \
    # Time series
    'date', 'lubridate', \
    # Visualization
    'ggplot2', 'plotly', \
    # Shiny ecosystem
    'shiny', 'shinydashboard', 'shinyWidgets', 'shinycssloaders', 'shinyjs', \
    # Data tables and UI
    'DT', \
    # File I/O
    'openxlsx', 'readxl', \
    # Statistical tests
    'lmtest', 'car', \
    # Mathematical operations
    'combinat', \
    # JSON processing
    'jsonlite' \
), repos='https://cran.rstudio.com/')"

# Install additional packages for enhanced analytics
RUN R -e "install.packages(c( \
    # Advanced time series
    'vars', 'urca', 'tsDyn', \
    # Machine learning
    'randomForest', 'caret', \
    # Parallel processing
    'parallel', 'foreach', 'doParallel', \
    # Network analysis
    'httr', 'curl' \
), repos='https://cran.rstudio.com/')"

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

# Copy enhanced R application files
COPY --chown=r-analytics:r-analytics shiny-app/enhanced-global.R ./shiny-app/global.R
COPY --chown=r-analytics:r-analytics shiny-app/enhanced-app9.R ./shiny-app/app.R

# Copy configuration and function files
COPY --chown=r-analytics:r-analytics config/ ./config/
COPY --chown=r-analytics:r-analytics functions/ ./functions/

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