# Base image with Node.js 22
FROM node:22-alpine AS base

# Builder stage
FROM base AS builder

# Install required system dependencies
RUN apk add --no-cache gcompat

# Enable Corepack to manage pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only dependency-related files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies with pnpm and cache the pnpm store
RUN --mount=type=cache,target=/root/.pnpm-store pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY tsconfig.json src ./

# Build the application
RUN pnpm run build

# Runner stage
FROM base AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy the built application and dependencies from the builder stage
COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

# Switch to the non-root user
USER hono

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "/app/dist/index.js"]
