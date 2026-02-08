# YOUSAF-PAIRING-V1 - WhatsApp Pairing Service
# Developer: Muhammad Yousaf Baloch
# GitHub: https://github.com/musakhanbaloch03-sad

FROM node:18-slim

# Metadata
LABEL maintainer="Muhammad Yousaf Baloch <musakhanbaloch03@gmail.com>"
LABEL description="YOUSAF WhatsApp Pairing Service"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all files
COPY . .

# Expose port
EXPOSE ${PORT:-8000}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
  CMD node -e "require('http').get('http://localhost:${PORT:-8000}/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
