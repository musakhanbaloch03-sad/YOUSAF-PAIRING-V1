# ╔══════════════════════════════════════════════════════════════════╗
# ║   YOUSAF-PAIRING-V1 — Official Dockerfile                       ║
# ║   Created by: Muhammad Yousaf Baloch                            ║
# ║   Compatible: Koyeb | Heroku | Railway | Render | VPS           ║
# ╚══════════════════════════════════════════════════════════════════╝

# ── Stage 1: Builder ────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install system dependencies for native modules (sharp, canvas, etc.)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    vips-dev \
    libc6-compat \
    openssl \
    ffmpeg

WORKDIR /app

# Copy package files FIRST for better Docker layer caching
COPY package.json ./

# ✅ FIX: Use npm install instead of npm ci to bypass lockfile issues
# This prevents "Missing lockfile" build failures on all platforms
RUN npm install --omit=dev --no-audit --no-fund

# ── Stage 2: Production Runtime ────────────────────────────────────
FROM node:20-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache \
    vips \
    libc6-compat \
    openssl \
    ffmpeg \
    tini

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S botuser -u 1001

WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY --chown=botuser:nodejs . .

# Create sessions directory with correct permissions
RUN mkdir -p /app/sessions && chown -R botuser:nodejs /app/sessions

USER botuser

# Expose port (Koyeb/Heroku/Railway/Render all use PORT env variable)
EXPOSE ${PORT:-8000}

# Health check for all platforms
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:${PORT:-8000}/').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

# Use tini as init system to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start the pairing server
CMD ["node", "index.js"]
