FROM node:20-alpine

# Professional dependencies installation for Yousaf-Baloch-MD
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    git \
    bash \
    ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (Fixed)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy project files
COPY . .

# Environment settings
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Start command
CMD ["npm", "start"]
