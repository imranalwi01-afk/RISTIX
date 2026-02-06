FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_R_ANALYTICS_BASE_URL
ARG NEXT_PUBLIC_ENVIRONMENT

# Make them available as environment variables during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_R_ANALYTICS_BASE_URL=$NEXT_PUBLIC_R_ANALYTICS_BASE_URL
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

# Install dependencies only when needed (package-level build)
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files (make lockfiles optional with wildcard)
COPY package.json pnpm-lock.yaml* package-lock.json* bun.lockb* ./
COPY . .

# Install dependencies for frontend package
RUN pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app ./

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy node_modules to ensure symlinks in standalone work
COPY --from=builder /app/node_modules ./node_modules
# Symlink root node_modules to /node_modules because pnpm links point to /node_modules
RUN ln -s /app/node_modules /node_modules || true

# Copy built artifacts from builder
COPY --from=builder /app/public ./public

# Set permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Note: standalone mode needs to be enabled in next.config.js/mjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4231

ENV PORT=4231
ENV HOSTNAME="0.0.0.0"

# Startup logic
CMD ["node", "server.js"]
