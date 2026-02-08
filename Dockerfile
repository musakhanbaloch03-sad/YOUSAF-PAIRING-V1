FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    wget \
    git

COPY package*.json ./

RUN npm install --omit=dev --ignore-scripts && \
    npm cache clean --force

COPY . .

RUN mkdir -p sessions tmp && \
    chmod -R 755 sessions tmp

ENV NODE_ENV=production \
    PORT=8000 \
    TZ=Asia/Karachi

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

CMD ["node", "index.js"]
