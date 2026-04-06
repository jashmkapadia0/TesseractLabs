# 3D Lab - Project Structure

Complete folder and file structure of the 3D Printing Farm web application.

```
3DLab/
├── README.md                          # Main project documentation
├── SETUP_GUIDE.md                     # Detailed setup instructions
├── docker-compose.yml                 # Docker orchestration
├── .gitignore                         # Git ignore rules
├── .env.example                       # Example environment variables
├── setup.sh                           # Setup script for Linux/Mac
├── setup.ps1                          # Setup script for Windows
│
├── backend/                           # Node.js Express API
│   ├── README.md                      # Backend documentation
│   ├── Dockerfile                     # Backend Docker config
│   ├── package.json                   # Node dependencies
│   ├── .env.example                   # Backend environment template
│   ├── .env                           # Backend environment (create this)
│   │
│   └── src/
│       ├── server.js                  # Express server entry point
│       │
│       ├── models/
│       │   └── Order.js               # MongoDB order schema
│       │
│       └── routes/
│           ├── upload.js              # STL upload endpoint
│           ├── payment.js             # Razorpay integration
│           └── orders.js              # Order management
│
├── python-service/                    # Flask microservice
│   ├── README.md                      # Python service docs
│   ├── Dockerfile                     # Python Docker config
│   ├── requirements.txt               # Python dependencies
│   ├── app.py                         # Flask application
│   ├── .env.example                   # Python env template
│   └── .env                           # Python environment (create this)
│
└── frontend/                          # React + Vite application
    ├── README.md                      # Frontend documentation
    ├── Dockerfile                     # Frontend Docker config
    ├── package.json                   # Node dependencies
    ├── vite.config.js                 # Vite configuration
    ├── tailwind.config.js             # Tailwind CSS config
    ├── postcss.config.js              # PostCSS config
    ├── index.html                     # HTML entry point
    ├── .env.example                   # Frontend env template
    ├── .env                           # Frontend environment (create this)
    │
    ├── public/
    │   └── vite.svg                   # Favicon
    │
    └── src/
        ├── main.jsx                   # React entry point
        ├── App.jsx                    # Root component
        ├── index.css                  # Global styles
        │
        ├── api/
        │   └── api.js                 # API client with Axios
        │
        ├── components/
        │   ├── Navbar.jsx             # Navigation bar
        │   └── STLViewer.jsx          # Three.js STL viewer
        │
        └── pages/
            ├── Home.jsx               # Landing page
            ├── Upload.jsx             # Upload & pricing page
            └── Orders.jsx             # Orders list page
```

## 📁 Key Files Explained

### Root Level
- **docker-compose.yml**: Orchestrates all services (MongoDB, Backend, Python, Frontend)
- **setup.sh/ps1**: Automated setup scripts for quick start
- **SETUP_GUIDE.md**: Comprehensive setup instructions

### Backend (`/backend`)
- **src/server.js**: Express server with middleware, routes, and MongoDB connection
- **src/models/Order.js**: Mongoose schema for orders
- **src/routes/upload.js**: Handles file upload, Python service integration, price calculation
- **src/routes/payment.js**: Razorpay order creation and payment verification
- **src/routes/orders.js**: Order retrieval and statistics

### Python Service (`/python-service`)
- **app.py**: Flask server with STL analysis using Trimesh library
- **requirements.txt**: Python dependencies (Flask, Trimesh, etc.)

### Frontend (`/frontend`)
- **src/main.jsx**: React application entry
- **src/App.jsx**: Router and layout structure
- **src/api/api.js**: Axios client for backend communication
- **src/components/Navbar.jsx**: Navigation component
- **src/components/STLViewer.jsx**: Three.js 3D model viewer
- **src/pages/Home.jsx**: Landing page with features and CTA
- **src/pages/Upload.jsx**: File upload, 3D preview, pricing, and payment
- **src/pages/Orders.jsx**: Admin dashboard for viewing all orders

## 🎨 Technology Stack by Folder

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Multer (file uploads)
- Razorpay SDK
- Axios (Python service communication)

### Python Service
- Flask
- Trimesh (STL analysis)
- NumPy

### Frontend
- React 18
- Vite
- Tailwind CSS
- Three.js + STLLoader
- React Router
- Axios
- Razorpay Checkout

## 🔗 Data Flow

```
User uploads STL
    ↓
Frontend (Upload.jsx)
    ↓
Backend (upload.js) → Saves file
    ↓
Python Service (app.py) → Analyzes STL with Trimesh
    ↓
Backend → Calculates price → Saves order to MongoDB
    ↓
Frontend → Displays results + 3D preview
    ↓
User clicks "Pay"
    ↓
Backend (payment.js) → Creates Razorpay order
    ↓
Frontend → Opens Razorpay modal
    ↓
User completes payment
    ↓
Backend → Verifies signature → Updates order status
    ↓
Frontend → Shows success message
```

## 📦 Dependencies Summary

### Backend (`package.json`)
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "multer": "^1.4.5-lts.1",
  "cors": "^2.8.5",
  "razorpay": "^2.9.2",
  "axios": "^1.6.2"
}
```

### Python (`requirements.txt`)
```
Flask==3.0.0
flask-cors==4.0.0
trimesh==4.0.10
numpy==1.26.2
```

### Frontend (`package.json`)
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.21.1",
  "three": "^0.160.0",
  "axios": "^1.6.2",
  "tailwindcss": "^3.4.0"
}
```

## 🌐 Ports

- Frontend: 5173
- Backend: 5000
- Python Service: 5001
- MongoDB: 27017

## 📝 Environment Variables

### Backend
- `MONGO_URI`: MongoDB connection string
- `PYTHON_SERVICE_URL`: Python service URL
- `RAZORPAY_KEY_ID`: Razorpay API key
- `RAZORPAY_SECRET`: Razorpay secret
- `WHATSAPP_NUMBER`: WhatsApp contact number
- `COST_PER_GRAM`: Material cost
- `HOURLY_RATE`: Machine hourly rate

### Python Service
- `FLASK_PORT`: Service port
- `FILAMENT_DENSITY`: Filament density (g/cm³)

### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_RAZORPAY_KEY_ID`: Razorpay public key
- `VITE_WHATSAPP_NUMBER`: WhatsApp contact

## 🚀 Deployment Checklist

- [ ] All environment files created
- [ ] Razorpay credentials configured
- [ ] MongoDB connection established
- [ ] Docker services running
- [ ] Frontend builds without errors
- [ ] Backend API responding
- [ ] Python service responding
- [ ] File uploads working
- [ ] 3D preview rendering
- [ ] Payment flow functional
- [ ] WhatsApp integration working
