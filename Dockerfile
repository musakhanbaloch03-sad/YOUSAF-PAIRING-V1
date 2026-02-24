# ╔══════════════════════════════════════════════════════════════════╗
# ║   YOUSAF-PAIRING-V1 — Official Dockerfile                       ║
# ║   Created by: Muhammad Yousaf Baloch                            ║
# ║   Compatible: Koyeb | Heroku | Railway | Render | VPS           ║
# ╚══════════════════════════════════════════════════════════════════╝

# ── Stage 1: Builder ────────────────────────────────────────────────
FROM node:20-alpine AS builder

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

COPY package.json ./

RUN npm install --omit=dev --no-audit --no-fund

# ── Stage 2: Production Runtime ─────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache \
    vips \
    libc6-compat \
    openssl \
    ffmpeg \
    tini \
    curl

# ✅ Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S botuser -u 1001

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --chown=botuser:nodejs . .

# ✅ Create sessions directory with correct permissions
RUN mkdir -p /app/sessions && \
    chown -R botuser:nodejs /app/sessions && \
    chown -R botuser:nodejs /app

USER botuser

EXPOSE ${PORT:-8000}

# ✅ Health check — curl سے /health endpoint check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "index.js"]
