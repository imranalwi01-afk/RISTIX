# Dockerfile for new-backend (Bun Single-File Executable)
# ============================================================================
# This creates a minimal container with a standalone binary - no Bun runtime needed!
# ============================================================================

# Stage 1: Build the executable
FROM oven/bun:1.1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Compile to single-file executable
# Note: We do NOT specify a --target. This allows Bun to auto-detect the container's architecture.
# - On Apple Silicon (M1/M2/M3), this builds a linux-aarch64 binary (Native performance, no Rosetta)
# - On Windows/Intel Linux, this builds a linux-x64 binary (Native performance)
RUN bun build src/index.ts --compile --outfile ./server

# Stage 2: Minimal production image
FROM debian:bookworm-slim AS runner

WORKDIR /app

# Install minimal runtime dependencies (libssl for HTTPS, ca-certificates)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the single executable
COPY --from=builder /app/server ./server

# Make executable
RUN chmod +x ./server

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Run the standalone executable
CMD ["./server"]
