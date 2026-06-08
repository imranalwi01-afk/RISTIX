# Dockerfile for new-backend (Bun Single-File Executable)
# ============================================================================
# This creates a minimal container with a standalone binary - no Bun runtime needed!
# ============================================================================

# Stage 1: Build the executable
FROM oven/bun:1.1 AS builder

WORKDIR /app

# Copy package files and bunfig.toml
COPY package.json bunfig.toml bun.lockb* pnpm-lock.yaml* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Compile to single-file executable
# Note: We do NOT specify a --target. This allows Bun to auto-detect the container's architecture.
# - On Apple Silicon (M1/M2/M3), this builds a linux-aarch64 binary (Native performance, no Rosetta)
# - On Windows/Intel Linux, this builds a linux-x64 binary (Native performance)
RUN bun build src/index.ts --compile --outfile ./server
RUN bun build src/cli.ts --compile --outfile ./ops

# Stage 2: Production image with shell support for health checks
FROM debian:12-slim AS runner

# Install ca-certificates for HTTPS connections and curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the single executable
COPY --from=builder /app/server ./server
COPY --from=builder /app/ops ./ops

ENV NODE_ENV=production
ENV PORT=4232
ENV HOST=0.0.0.0

EXPOSE 4232

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -sf http://localhost:4232/api/v1/health || exit 1

# Run the standalone executable
CMD ["./server"]
