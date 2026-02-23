FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_R_ANALYTICS_BASE_URL
ARG NEXT_PUBLIC_ENVIRONMENT
ARG NEXT_PUBLIC_FRONTEND_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_BACKEND_API_URL
ARG NEXT_PUBLIC_R_ANALYTICS_URL
ARG NEXT_PUBLIC_R_API_URL

# Make them available as environment variables during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_R_ANALYTICS_BASE_URL=$NEXT_PUBLIC_R_ANALYTICS_BASE_URL
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL
ENV NEXT_PUBLIC_R_ANALYTICS_URL=$NEXT_PUBLIC_R_ANALYTICS_URL
ENV NEXT_PUBLIC_R_API_URL=$NEXT_PUBLIC_R_API_URL

# Install dependencies only when needed (package-level build)
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files (make lockfiles optional with wildcard)
COPY package.json pnpm-lock.yaml* package-lock.json* bun.lockb* ./

# Install dependencies for frontend package
RUN pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

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
# Startup logic
CMD ["node", "server.js"]
