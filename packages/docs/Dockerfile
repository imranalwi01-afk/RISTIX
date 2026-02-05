
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install PNPM
RUN npm install -g pnpm@9.15.4

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build Docusaurus
RUN pnpm build

# Serve Stage
FROM node:20-alpine AS serve

WORKDIR /app
RUN npm install -g pnpm@9.15.4

# Copy files from build stage
COPY --from=base /app/build ./build
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base /app/docusaurus.config.ts ./docusaurus.config.ts
COPY --from=base /app/sidebars.ts ./sidebars.ts

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Expose Docusaurus port
EXPOSE 3000

# Start command
CMD ["pnpm", "serve", "--port", "3000", "--host", "0.0.0.0"]
