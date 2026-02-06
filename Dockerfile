FROM node:18-alpine

# Install dependencies for sharp and baileys
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm packages
RUN npm ci --production=false --legacy-peer-deps || npm install --legacy-peer-deps

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
