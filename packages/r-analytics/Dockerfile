# packages/r-analytics/Dockerfile

FROM rocker/r-ver:4.3.2

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends build-essential pkg-config cmake gfortran libblas-dev liblapack-dev && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev libssl-dev libcurl4-openssl-dev libxml2-dev libicu-dev && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends libcairo2-dev libxt-dev libfontconfig1-dev libfreetype6-dev libpng-dev libjpeg-dev libtiff5-dev libwebp-dev libharfbuzz-dev libfribidi-dev zlib1g-dev && rm -rf /var/lib/apt/lists/*

ENV MAKEFLAGS="-j$(nproc)"
ENV RENV_CONFIG_REPOS_OVERRIDE="https://cloud.r-project.org"
ENV R_PORT=3838

WORKDIR /opt/r-analytics

COPY renv.lock ./renv.lock
RUN R -e "options(repos=c(CRAN='https://cloud.r-project.org')); install.packages('renv')"
RUN R -e "renv::consent(TRUE); renv::restore(project='.', lockfile='renv.lock', prompt=FALSE)"

COPY shiny-app ./shiny-app
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

RUN groupadd -r r-analytics && useradd -r -g r-analytics -d /home/r-analytics -s /bin/bash r-analytics \
    && mkdir -p /home/r-analytics /opt/r-analytics/logs /opt/r-analytics/temp \
    && chown -R r-analytics:r-analytics /home/r-analytics /opt/r-analytics

USER r-analytics
WORKDIR /opt/r-analytics/shiny-app

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3838/ || exit 1

EXPOSE 3838

ENTRYPOINT ["/opt/r-analytics/docker-entrypoint.sh"]
