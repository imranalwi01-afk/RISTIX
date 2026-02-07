# packages/r-analytics/Dockerfile
# ============================================================================
# 🐳 R ANALYTICS APP CONTAINER
# ============================================================================
# Extends: ghcr.io/ifrspro/ifrs9-iaf/r-analytics-base
# Contains: Application code ONLY (fast builds)
# ============================================================================

FROM ghcr.io/ifrspro/ifrs9-iaf/r-analytics-base:latest

# Metadata
LABEL maintainer="IFRS9 Platform Team"
LABEL description="Multi-tenant R Analytics App Layer"
LABEL version="1.0.0"

# ============================================================================
# 📄 COPY APPLICATION FILES
# ============================================================================

# Copy R application files if they exist
COPY --chown=r-analytics:r-analytics shiny-app/*.R ./shiny-app/

# Rename entry point to standard app.R
RUN if [ -f ./shiny-app/app34.R ]; then mv ./shiny-app/app34.R ./shiny-app/app.R; fi

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
RUN echo "run_as r-analytics; \n\
    server { \
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