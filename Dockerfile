# YOUSAF-PAIRING-V1 - WhatsApp Pairing Service
# Developer: Muhammad Yousaf Baloch

FROM node:18-slim

# Metadata
LABEL maintainer="Muhammad Yousaf Baloch <musakhanbaloch03@gmail.com>"
LABEL description="YOUSAF WhatsApp Pairing Service"
LABEL version="1.0.0"

# Install git and other dependencies (CRITICAL!)
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy all application files
COPY . .

# Create session directory (FIXED: sessions not session)
RUN mkdir -p sessions

# Set environment variable
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start application
CMD ["npm", "start"]
