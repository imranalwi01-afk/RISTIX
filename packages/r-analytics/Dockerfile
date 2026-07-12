# packages/r-analytics/Dockerfile
# ============================================================================
# 🐳 R ANALYTICS APP CONTAINER
# ============================================================================
# Extends: ghcr.io/imranalwi01-afk/ristix/r-analytics-base
# Contains: Application code ONLY (fast builds)
# ============================================================================

FROM ghcr.io/imranalwi01-afk/ristix/r-analytics-base:latest

# Metadata
LABEL maintainer="IFRS9 Platform Team"
LABEL description="Multi-tenant R Analytics App Layer"
LABEL version="1.0.0"


# ============================================================================
# 📄 COPY APPLICATION FILES
# ============================================================================

# Copy R application files recursively
COPY --chown=r-analytics:r-analytics shiny-app/ ./shiny-app/

# Copy configuration files if they exist
COPY --chown=r-analytics:r-analytics config/ ./config/

# Copy startup script
COPY --chown=r-analytics:r-analytics docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Copy API/runtime files
COPY --chown=r-analytics:r-analytics iaf-r-api.R start_api.R logger.R ./
COPY --chown=r-analytics:r-analytics api/ ./api/
COPY --chown=r-analytics:r-analytics src/ ./src/
COPY --chown=r-analytics:r-analytics scripts/ ./scripts/

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
ENV R_ENABLE_CORS=true

# Database connection defaults
ENV DB_HOST=host.docker.internal
ENV DB_PORT=5433
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV FRS9_DB_HOST=host.docker.internal
ENV FRS9_DB_PORT=5433
ENV FRS9_DB_USER=postgres
ENV FRS9_DB_PASSWORD=postgres

# R and Shiny configuration
ENV R_LIBS_USER=/opt/r-analytics/R-libs
ENV SHINY_HOST=0.0.0.0
ENV SHINY_PORT=4236
# Keep semver format to avoid Shiny compareVersion() failures when base image exports "latest".
ENV SHINY_SERVER_VERSION=1.5.23

# Create R library directory
RUN mkdir -p $R_LIBS_USER && chown r-analytics:r-analytics $R_LIBS_USER

# Fix permissions for shiny-server runtime directories
RUN mkdir -p /var/lib/shiny-server/bookmarks && \
    chown -R r-analytics:r-analytics /var/lib/shiny-server

# ============================================================================
# 🚀 STARTUP CONFIGURATION
# ============================================================================

# Switch to non-root user
USER r-analytics

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4236/ || exit 1

# Expose Shiny port and API port
EXPOSE 4236 4241

# Volume for logs and temporary files
VOLUME ["/opt/r-analytics/logs", "/opt/r-analytics/temp"]

# Start the application
ENTRYPOINT ["./docker-entrypoint.sh"]
