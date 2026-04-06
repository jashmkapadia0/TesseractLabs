#!/bin/bash

# Quick Setup Script for 3D Lab
# Run this script to set up all environment files

echo "🚀 3D Lab - Setup Script"
echo ""

# Create backend .env
echo "📝 Creating backend/.env..."
cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://mongodb:27017/3dlab
PYTHON_SERVICE_URL=http://python-service:5001

# Razorpay credentials (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# WhatsApp number (with country code, no +)
WHATSAPP_NUMBER=919876543210

# Pricing configuration
COST_PER_GRAM=0.5
HOURLY_RATE=100
EOF

# Create python-service .env
echo "📝 Creating python-service/.env..."
cat > python-service/.env << 'EOF'
FLASK_PORT=5001
FILAMENT_DENSITY=1.24
EOF

# Create frontend .env
echo "📝 Creating frontend/.env..."
cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
VITE_WHATSAPP_NUMBER=919876543210
EOF

echo ""
echo "✅ Environment files created!"
echo ""
echo "⚠️  IMPORTANT: Edit the following files with your credentials:"
echo "   1. backend/.env - Add your Razorpay API keys"
echo "   2. frontend/.env - Add your Razorpay public key"
echo ""
echo "📖 Next steps:"
echo "   1. Get Razorpay credentials from https://dashboard.razorpay.com/"
echo "   2. Update the .env files with your keys"
echo "   3. Run: docker-compose up --build"
echo ""
