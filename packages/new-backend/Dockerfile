# Dockerfile for new-backend (Bun Single-File Executable)
# ============================================================================
# This creates a minimal container with a standalone binary - no Bun runtime needed!
# ============================================================================

# Stage 1: Build the executable
FROM oven/bun:1.1 AS builder

WORKDIR /app

# Copy package files and bunfig.toml
COPY package.json bunfig.toml ./

# Install dependencies (no lockfile)
RUN bun install

# Copy source code
COPY . .

# Compile to single-file executable
# Note: We do NOT specify a --target. This allows Bun to auto-detect the container's architecture.
# - On Apple Silicon (M1/M2/M3), this builds a linux-aarch64 binary (Native performance, no Rosetta)
# - On Windows/Intel Linux, this builds a linux-x64 binary (Native performance)
RUN bun build src/index.ts --compile --outfile ./server

# Stage 2: Minimal production image
FROM gcr.io/distroless/cc-debian12 AS runner

WORKDIR /app

# Copy the single executable
COPY --from=builder /app/server ./server

# Make executable
# Make executable (handled by builder or copy)
# RUN chmod +x ./server

ENV NODE_ENV=production
ENV PORT=4232
ENV HOST=0.0.0.0

EXPOSE 4232

# Health check
# Health check (Disabled in distroless as curl/wget are missing)
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:4232/api/health || exit 1

# Run the standalone executable
CMD ["./server"]
