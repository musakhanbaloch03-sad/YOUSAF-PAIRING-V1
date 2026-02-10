#!/bin/bash

# ╔══════════════════════════════════════════════════╗
# ║         YOUSAF-BALOCH-MD PAIRING SERVICE         ║
# ║            Created by Yousuf Baloch              ║
# ╚══════════════════════════════════════════════════╝

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       🚀 YOUSAF PAIRING V1 - STARTING...        ║"
echo "║          👤 Created by Yousuf Baloch             ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js >= 18"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be >= 18! Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "📦 Installing dependencies..."
npm install --silent

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

echo "✅ Dependencies installed!"
echo ""
echo "🌐 Starting Pairing Server..."
echo ""

node index.js
