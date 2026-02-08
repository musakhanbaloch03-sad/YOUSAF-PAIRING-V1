FROM node:20-alpine

# Install all required dependencies including git
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

# Install dependencies with git support
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy all project files
COPY . .

# Environment settings
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Start command
CMD ["npm", "start"]
