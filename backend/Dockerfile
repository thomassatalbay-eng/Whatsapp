# Use official Node.js image with Chromium pre-installed
FROM node:20-slim

# Install Chromium and missing shared libraries required by Puppeteer on Linux
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    ca-certificates \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt-get/lists/*

# Set Puppeteer executable path to installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
