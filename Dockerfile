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

# Copy package files (Error Fix: Ensure all manifests are copied)
COPY package.json package-lock.json* ./

# Professional Install (Error Fix: Build dependencies for sharp/baileys)
RUN npm install --include=dev && npm install --legacy-peer-deps

# Copy project files
COPY . .

# Environment settings for Web Interface
ENV NODE_ENV=production
ENV PORT=8000

# Expose port (Fixed to match your index.js and Koyeb best practice)
EXPOSE 8000

# Start command
CMD ["npm", "start"]
