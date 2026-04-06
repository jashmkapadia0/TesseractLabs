# 🚀 Quick Start Guide - 3D Lab

This guide will help you get the 3D Lab application up and running in minutes.

## 📋 Prerequisites

### Required
- **Docker Desktop** (Windows/Mac) or **Docker + Docker Compose** (Linux)
- **Git** (to clone the repository)

### Optional (for local development without Docker)
- Node.js 18+
- Python 3.9+
- MongoDB

## 🎯 Quick Start (Recommended)

### Step 1: Set Up Environment Variables

#### Windows (PowerShell)
```powershell
.\setup.ps1
```

#### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

This will create `.env` files in all three folders:
- `backend/.env`
- `python-service/.env`
- `frontend/.env`

### Step 2: Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up / Log in
3. Navigate to Settings → API Keys
4. Generate Test Keys (or Live Keys for production)
5. Copy:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret**

### Step 3: Update Environment Files

Edit `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_SECRET=YOUR_SECRET_HERE
WHATSAPP_NUMBER=919876543210  # Your WhatsApp number
```

Edit `frontend/.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
VITE_WHATSAPP_NUMBER=919876543210
```

### Step 4: Start All Services

```bash
docker-compose up --build
```

This will start:
- ✅ MongoDB (port 27017)
- ✅ Python Service (port 5001)
- ✅ Backend API (port 5000)
- ✅ Frontend (port 5173)

### Step 5: Access the Application

Open your browser and visit:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Python Service:** http://localhost:5001

## 🧪 Testing the Application

### Upload an STL File

1. Go to http://localhost:5173/upload
2. Click "Click to select STL file"
3. Choose any `.stl` file
4. Click "Analyze & Get Quote"
5. View the 3D preview and price calculation
6. Click "Pay via Razorpay" or "Send via WhatsApp"

### Test Razorpay Payment (Test Mode)

When using test keys, use these test card details:
- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### View Orders

Go to http://localhost:5173/orders to see all uploaded files and their payment status.

## 🛠️ Local Development (Without Docker)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Python Service
```bash
cd python-service
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### MongoDB
You'll need MongoDB running locally on port 27017, or update the `MONGO_URI` in `backend/.env`.

## 📱 WhatsApp Integration

The WhatsApp number should be in international format without the `+` sign:
- ✅ Correct: `919876543210` (for India)
- ❌ Wrong: `+919876543210`

## 🔧 Troubleshooting

### Docker Issues

**Container fails to start:**
```bash
docker-compose down
docker-compose up --build
```

**Port already in use:**
Edit `docker-compose.yml` and change the port mappings, e.g., `5000:5000` to `5001:5000`.

### Python Service Issues

**Trimesh errors:**
The Docker image includes all necessary dependencies. If running locally, ensure you have:
```bash
pip install trimesh[easy]
```

### Backend Connection Issues

**Python service not reachable:**
Make sure the Python service is running and accessible at the URL specified in `PYTHON_SERVICE_URL`.

**MongoDB connection failed:**
Ensure MongoDB container is running:
```bash
docker-compose ps
```

### Frontend Issues

**API calls failing:**
Check that `VITE_API_URL` in `frontend/.env` matches your backend URL.

**Razorpay not loading:**
1. Verify `VITE_RAZORPAY_KEY_ID` is set correctly
2. Check browser console for errors
3. Ensure you're using the correct test/live key

## 🔒 Security Notes

### For Production:
1. Change `NODE_ENV` to `production`
2. Use Razorpay live keys (not test keys)
3. Enable HTTPS
4. Set up proper CORS origins in backend
5. Use environment variables, never commit secrets
6. Set up MongoDB authentication
7. Implement proper user authentication
8. Add rate limiting
9. Set up file storage (S3, etc.)
10. Enable logging and monitoring

## 📊 Pricing Configuration

Edit `backend/.env` to adjust pricing:
```env
COST_PER_GRAM=0.5       # Price per gram of filament
HOURLY_RATE=100         # Machine hourly rate in currency
```

Formula: `Price = (grams × cost_per_gram) + (hours × hourly_rate) + 10% handling`

## 🎨 Customization

### Branding
- Update `frontend/src/components/Navbar.jsx` for logo/name
- Modify `frontend/tailwind.config.js` for colors
- Edit `frontend/index.html` for title and meta tags

### Features
- Add authentication in `backend/src/middleware/`
- Add more file formats in upload validation
- Customize pricing logic in `backend/src/routes/upload.js`

## 📝 API Testing

### Using cURL

**Upload STL:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@model.stl"
```

**Get Orders:**
```bash
curl http://localhost:5000/api/orders
```

## 🆘 Support

For issues:
1. Check the logs: `docker-compose logs [service-name]`
2. Review the README files in each folder
3. Check environment variables are correctly set

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Trimesh Documentation](https://trimsh.org/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

## ✅ Success Checklist

- [ ] Docker is installed and running
- [ ] Razorpay account created and test keys obtained
- [ ] All `.env` files created and populated
- [ ] `docker-compose up --build` completed successfully
- [ ] Frontend accessible at http://localhost:5173
- [ ] Backend API responding at http://localhost:5000
- [ ] Python service responding at http://localhost:5001
- [ ] Test STL file uploaded successfully
- [ ] 3D preview working
- [ ] Price calculation displayed
- [ ] Payment modal opens (test mode)
- [ ] WhatsApp link works

---

**🎉 Congratulations!** Your 3D Lab is now running!
