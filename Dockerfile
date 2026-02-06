FROM node:20-alpine

# Install dependencies for sharp, baileys, and git
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm packages
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
