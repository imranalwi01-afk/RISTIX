FROM node:18-alpine AS base

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

# Copy built artifacts from builder
# We need to copy from the specific package location
COPY --from=builder /app/packages/frontend/public ./public

# Set permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Note: standalone mode needs to be enabled in next.config.js/mjs
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 4231

ENV PORT 4231
ENV HOSTNAME "0.0.0.0"

# Standalone mode usually produces a server.js in the root of standalone directory
# But since we are inside a monorepo structure in standalone, we might need to adjust command
# Usually standalone output preserves directory structure if it's outside?
# Let's assume standard behavior: /app/.next/standalone/packages/frontend/server.js or similar?
# Actually, let's verify where standalone puts things.
# If nextConfig.output = 'standalone', it produces .next/standalone.
# In a monorepo, it often includes node_modules and the package structure.
# CMD ["node", "packages/frontend/server.js"] might be required.
# Let's try standard invocation from the copied root.

CMD ["node", "packages/frontend/server.js"]
