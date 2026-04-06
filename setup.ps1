# Quick Setup Script for 3D Lab
# Run this script to set up all environment files

Write-Host "🚀 3D Lab - Setup Script" -ForegroundColor Cyan
Write-Host ""

# Create backend .env
Write-Host "📝 Creating backend/.env..." -ForegroundColor Yellow
$backendEnv = @"
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
"@
$backendEnv | Set-Content -Path "backend/.env"

# Create python-service .env
Write-Host "📝 Creating python-service/.env..." -ForegroundColor Yellow
$pythonEnv = @"
FLASK_PORT=5001
FILAMENT_DENSITY=1.24
"@
$pythonEnv | Set-Content -Path "python-service/.env"

# Create frontend .env
Write-Host "📝 Creating frontend/.env..." -ForegroundColor Yellow
$frontendEnv = @"
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
VITE_WHATSAPP_NUMBER=919876543210
"@
$frontendEnv | Set-Content -Path "frontend/.env"

Write-Host ""
Write-Host "✅ Environment files created!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Edit the following files with your credentials:" -ForegroundColor Yellow
Write-Host "   1. backend/.env - Add your Razorpay API keys" -ForegroundColor White
Write-Host "   2. frontend/.env - Add your Razorpay public key" -ForegroundColor White
Write-Host ""
Write-Host "📖 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Get Razorpay credentials from https://dashboard.razorpay.com/" -ForegroundColor White
Write-Host "   2. Update the .env files with your keys" -ForegroundColor White
Write-Host "   3. Run: docker-compose up --build" -ForegroundColor White
Write-Host ""
