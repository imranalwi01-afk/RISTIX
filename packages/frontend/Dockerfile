FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all packages (filtered by .dockerignore) to ensure workspace resolution works
# This is a bit heavy but ensures lockfile matches what's on disk for pnpm
COPY packages ./packages

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/package.json ./package.json

# Build the frontend
WORKDIR /app/packages/frontend

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build
RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy root node_modules to ensure symlinks in standalone work
COPY --from=builder /app/node_modules ./node_modules
# Symlink root node_modules to /node_modules because pnpm links point to /node_modules
RUN ln -s /app/node_modules /node_modules || true

# Copy built artifacts from builder
# We need to copy from the specific package location
# Copy built artifacts from builder
# We need to copy from the specific package location
COPY --from=builder /app/packages/frontend/public ./packages/frontend/public

# Set permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Note: standalone mode needs to be enabled in next.config.js/mjs
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/static ./packages/frontend/.next/static

USER nextjs

EXPOSE 4231

ENV PORT 4231
ENV HOSTNAME "0.0.0.0"

# Startup logic
CMD ["node", "packages/frontend/server.js"]
