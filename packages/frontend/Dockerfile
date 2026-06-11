# ============================================================================
# 🚀 IFRS9 Frontend - Optimized Multi-Stage Docker Build
# ============================================================================
# Uses pnpm with content-addressable store for faster installs.
# Layer ordering maximizes build cache hits:
#   1. pnpm version + store location (rarely changes)
#   2. package.json + lockfile (changes only on dependency updates)
#   3. Source code (changes on every push)
# ============================================================================

FROM node:20-alpine AS base

# Pin pnpm version for reproducible builds
RUN npm install -g pnpm@10.14.0

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_R_ANALYTICS_BASE_URL
ARG NEXT_PUBLIC_ENVIRONMENT
ARG NEXT_PUBLIC_FRONTEND_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_BACKEND_API_URL
ARG NEXT_PUBLIC_R_ANALYTICS_URL
ARG NEXT_PUBLIC_R_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_RAPI_BASE_URL

# Make them available as environment variables during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_R_ANALYTICS_BASE_URL=$NEXT_PUBLIC_R_ANALYTICS_BASE_URL
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL
ENV NEXT_PUBLIC_R_ANALYTICS_URL=$NEXT_PUBLIC_R_ANALYTICS_URL
ENV NEXT_PUBLIC_R_API_URL=$NEXT_PUBLIC_R_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_RAPI_BASE_URL=$NEXT_PUBLIC_RAPI_BASE_URL

# ============================================================================
# DEPENDENCIES LAYER
# Changes only when package.json or lockfile changes
# ============================================================================
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Configure pnpm store to use /tmp (writable and cacheable)
ENV PNPM_HOME=/tmp/pnpm-store
ENV npm_config_store_dir=/tmp/pnpm-store

# Copy package files (make lockfiles optional with wildcard)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile --store-dir=/tmp/pnpm-store

# ============================================================================
# BUILDER LAYER
# Changes on every source code modification
# ============================================================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN pnpm run build

# ============================================================================
# PRODUCTION LAYER
# Minimal runtime image with only what's needed
# ============================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built artifacts from builder
COPY --from=builder /app/public ./public

# Set permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# In standalone mode, we copy the standalone folder content
# Note: Next.js standalone includes the server.js and a minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN echo "Debugging server deployment - /app content:" && ls -R /app

USER nextjs

EXPOSE 4231

ENV PORT=4231
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4231/system/health || exit 1

# Startup logic
CMD ["node", "server.js"]
