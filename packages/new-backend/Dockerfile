# ============================================================================
# 🚀 IFRS9 Backend - Optimized Multi-Stage Docker Build
# ============================================================================
# Produces a minimal Debian-based image with a single-file binary.
# Layer ordering maximizes build cache hits.
# ============================================================================

# Stage 1: Build the executable
FROM oven/bun:1.1 AS builder

WORKDIR /app

# Layer 1: Copy manifest files (only invalidated on dependency changes)
COPY package.json bunfig.toml bun.lockb* pnpm-lock.yaml* ./

# Layer 2: Install dependencies (cached unless package.json changes)
RUN bun install --no-frozen-lockfile

# Layer 3: Copy source (invalidated on every code change)
COPY . .

# Layer 4: Compile single-file executables (fastest possible rebuild)
RUN bun build src/index.ts --compile --outfile ./server
RUN bun build src/cli.ts --compile --outfile ./ops

# Stage 2: Production image with shell support for health checks
FROM debian:12-slim AS runner

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only the compiled binaries
COPY --from=builder /app/server ./server
COPY --from=builder /app/ops ./ops

ENV NODE_ENV=production
ENV PORT=4232
ENV HOST=0.0.0.0

EXPOSE 4232

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -sf http://localhost:4232/api/v1/health || exit 1

CMD ["./server"]
