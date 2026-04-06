# 🚀 Getting Started with 3D Lab

Welcome! This guide will help you get your 3D Printing Farm application running in **under 10 minutes**.

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Docker Desktop** installed and running
  - Windows/Mac: [Download here](https://www.docker.com/products/docker-desktop/)
  - Linux: Install Docker Engine + Docker Compose
- [ ] **Git** (optional, for version control)
- [ ] **Razorpay account** (free test account)
- [ ] **WhatsApp Business number** (optional)

## 🎯 Quick Start (3 Steps)

### Step 1: Set Up Environment Files (2 minutes)

Open PowerShell/Terminal in the `3DLab` directory and run:

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

This creates three `.env` files:
- `backend/.env`
- `python-service/.env`
- `frontend/.env`

### Step 2: Get Razorpay Credentials (3 minutes)

1. Go to [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
2. Sign up (it's free!)
3. Go to **Settings** → **API Keys** → **Generate Test Key**
4. Copy your:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

### Step 3: Update Configuration (2 minutes)

Edit `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_YourKeyHere
RAZORPAY_SECRET=YourSecretHere
WHATSAPP_NUMBER=919876543210  # Your number with country code
```

Edit `frontend/.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyHere
VITE_WHATSAPP_NUMBER=919876543210
```

### Step 4: Launch! (3 minutes)

```bash
docker-compose up --build
```

Wait for all services to start. You'll see:
```
✅ 3dlab-mongodb      Running
✅ 3dlab-python      Running
✅ 3dlab-backend     Running
✅ 3dlab-frontend    Running
```

## 🌐 Access Your Application

Open your browser:

- **Frontend (Main App):** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Python Service:** [http://localhost:5001](http://localhost:5001)

## 🧪 Test It Out!

### 1. Upload an STL File

1. Go to [http://localhost:5173/upload](http://localhost:5173/upload)
2. Click **"Click to select STL file"**
3. Choose any `.stl` file (find free models at [Thingiverse](https://www.thingiverse.com/))
4. Click **"Analyze & Get Quote"**

### 2. View 3D Preview

The STL file will appear in a 3D viewer:
- **Left mouse + drag**: Rotate
- **Scroll wheel**: Zoom in/out
- **Right mouse + drag**: Pan

### 3. Get Price Quote

You'll see:
- ✅ Total price
- ✅ Material volume (mm³)
- ✅ Estimated weight (grams)
- ✅ Print time estimate
- ✅ Price breakdown

### 4. Test Payment (Test Mode)

Click **"Pay via Razorpay"** and use these test credentials:

**Test Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date
- Name: Any name

### 5. View Orders

Go to [http://localhost:5173/orders](http://localhost:5173/orders) to see all uploads and payment statuses.

## 📱 WhatsApp Integration

Click **"Send Order via WhatsApp"** to share the order details on WhatsApp. Make sure your WhatsApp number is correct in the `.env` files.

## 🛑 Stop the Application

Press `Ctrl+C` in the terminal, then:

```bash
docker-compose down
```

To remove all data (orders, uploads):
```bash
docker-compose down -v
```

## 🔧 Troubleshooting

### Services Won't Start

```bash
docker-compose down
docker-compose up --build
```

### Port Already in Use

Edit `docker-compose.yml` and change the port mappings:
```yaml
ports:
  - "5174:5173"  # Changed from 5173
```

### Payment Not Working

1. Verify `RAZORPAY_KEY_ID` in both `backend/.env` and `frontend/.env`
2. Make sure you're using **test keys** (start with `rzp_test_`)
3. Check browser console for errors (F12)

### Upload Fails

1. Ensure file is `.stl` format
2. Check file size is under 100MB
3. Verify Python service is running:
   ```bash
   curl http://localhost:5001/health
   ```

### 3D Preview Not Showing

1. Clear browser cache
2. Try a different STL file
3. Check browser console for errors

## 📁 Project Structure

```
3DLab/
├── frontend/       # React + Three.js UI
├── backend/        # Node.js API
├── python-service/ # STL analysis
└── docker-compose.yml
```

## 📚 Documentation

- **[README.md](README.md)** - Overview
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - File structure

## 🎨 Customization

### Change Pricing

Edit `backend/.env`:
```env
COST_PER_GRAM=0.5    # Material cost per gram
HOURLY_RATE=100      # Machine hourly rate
```

### Change Colors

Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  accent: {
    primary: '#3b82f6',  // Blue
    secondary: '#8b5cf6', // Purple
  }
}
```

## 🚀 What's Next?

### Learning Path:
1. ✅ Get the app running (you're here!)
2. 📖 Read the [API Documentation](API_DOCUMENTATION.md)
3. 🎨 Customize the UI and branding
4. 🔐 Add authentication for admin features
5. 📱 Set up a production server
6. 🌐 Deploy to the cloud

### Feature Ideas:
- [ ] User accounts and login
- [ ] Order tracking and notifications
- [ ] Multiple material options (PLA, ABS, PETG)
- [ ] Color selection
- [ ] Infill and quality settings
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Invoice generation
- [ ] Shipping integration

## 💡 Tips

### Development Workflow:
1. Make changes to your code
2. Services auto-reload (frontend and backend)
3. For Python changes, restart: `docker-compose restart python-service`

### Viewing Logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f python-service
docker-compose logs -f frontend
```

### Database Access:
```bash
# Connect to MongoDB
docker exec -it 3dlab-mongodb mongosh 3dlab

# View orders
db.orders.find().pretty()
```

## 🆘 Need Help?

1. **Check logs**: `docker-compose logs [service-name]`
2. **Review documentation**: All `.md` files in the project
3. **Test individual services**:
   ```bash
   curl http://localhost:5000/health  # Backend
   curl http://localhost:5001/health  # Python
   ```

## ✅ Success Checklist

You're all set if:

- [ ] All Docker containers are running
- [ ] Frontend loads at http://localhost:5173
- [ ] You can upload an STL file
- [ ] 3D preview displays the model
- [ ] Price calculation shows correctly
- [ ] Payment modal opens (Razorpay)
- [ ] Orders page shows your upload
- [ ] WhatsApp link works

## 🎉 Congratulations!

You now have a fully functional 3D printing farm web application with:
- ✅ STL file upload and analysis
- ✅ Real-time 3D preview
- ✅ Automatic price calculation
- ✅ Payment processing
- ✅ Order management
- ✅ WhatsApp integration

**Start printing! 🖨️**

---

## 📞 Support

- Documentation: Check the `*.md` files
- Logs: `docker-compose logs -f`
- Issues: Review error messages carefully

**Happy 3D Printing! 🎨🖨️**
