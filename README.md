# Tesseract Labs Application

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Three.js** for 3D STL file viewing
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** for database
- **Multer** for file uploads
- **Razorpay** payment integration

### Microservice
- **Python Flask** service
- **Trimesh** library for STL analysis

### DevOps
- **Docker Compose** for local development
- Multi-container setup

## 📁 Project Structure

```
3DLab/
├── frontend/          # React + Vite application
├── backend/           # Node.js Express API
├── python-service/    # Flask microservice for STL analysis
├── docker-compose.yml # Docker orchestration
└── README.md          # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://mongodb:27017/3dlab
PYTHON_SERVICE_URL=http://python-service:5001
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
WHATSAPP_NUMBER=919876543210
COST_PER_GRAM=0.5
HOURLY_RATE=100
```

#### Python Service (.env)
```env
FLASK_PORT=5001
FILAMENT_DENSITY=1.24
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Quick Start with Docker

1. **Clone the repository**
```bash
cd 3DLab
```

2. **Create environment files**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your Razorpay credentials

# Python Service
cp python-service/.env.example python-service/.env

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Razorpay key
```

3. **Start all services**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Python Service: http://localhost:5001
- MongoDB: localhost:27017

### Local Development (Without Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Python Service
```bash
cd python-service
pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Features

### User Features
- ✅ Upload STL files
- ✅ Real-time 3D preview with Three.js
- ✅ Automatic price calculation
- ✅ Pay via Razorpay
- ✅ Send order via WhatsApp
- ✅ View order history

### Admin Features
- ✅ View all orders
- ✅ Track payment status
- ✅ Manage pricing parameters

### Technical Features
- ✅ STL volume calculation using Trimesh
- ✅ Material usage estimation
- ✅ Secure payment processing
- ✅ File size validation
- ✅ Error handling
- ✅ Loading indicators
- ✅ Mobile responsive design

## 📖 API Documentation

### Backend Endpoints

#### Upload STL File
```http
POST /api/upload
Content-Type: multipart/form-data

Body: {
  file: <STL file>
}

Response: {
  success: true,
  data: {
    filename: "model.stl",
    volume: 12500.5,
    grams: 15.5,
    price: 107.75,
    orderId: "abc123"
  }
}
```

#### Create Payment Order
```http
POST /api/razorpay/create-order
Content-Type: application/json

Body: {
  orderId: "abc123"
}

Response: {
  success: true,
  data: {
    razorpayOrderId: "order_xxx",
    amount: 10775,
    currency: "INR"
  }
}
```

#### Verify Payment
```http
POST /api/payment/verify
Content-Type: application/json

Body: {
  orderId: "abc123",
  razorpay_payment_id: "pay_xxx",
  razorpay_order_id: "order_xxx",
  razorpay_signature: "signature_xxx"
}

Response: {
  success: true,
  message: "Payment verified successfully"
}
```

#### Get All Orders
```http
GET /api/orders

Response: {
  success: true,
  data: [
    {
      _id: "abc123",
      filename: "model.stl",
      volume: 12500.5,
      grams: 15.5,
      price: 107.75,
      payment_status: "completed",
      createdAt: "2026-02-12T10:30:00Z"
    }
  ]
}
```

### Python Service Endpoints

#### Analyze STL File
```http
POST /analyze
Content-Type: multipart/form-data

Body: {
  file: <STL file>
}

Response: {
  volume: 12500.5,
  estimated_grams: 15.5,
  bounding_box: {
    width: 50,
    height: 30,
    depth: 40
  }
}
```

## 🎨 UI Screenshots

The application features a dark, modern industrial design with:
- Clean minimal interface
- Smooth animations
- Mobile-responsive layout
- Intuitive navigation

## 🔒 Security

- Environment variables for sensitive data
- Payment signature verification
- File type validation
- Size limits on uploads
- CORS configuration

## 📱 WhatsApp Integration

Orders can be shared via WhatsApp with pre-filled message containing:
- File name
- Calculated price
- Volume and material info

## 💳 Payment Integration

Razorpay integration includes:
- Order creation
- Payment verification
- Webhook handling (optional)
- Test mode support

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Considerations
- Set NODE_ENV=production
- Use production MongoDB instance
- Enable HTTPS
- Set up proper CORS origins
- Configure file storage (AWS S3, etc.)
- Set up logging and monitoring
- Enable Razorpay production mode

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@3dlab.com or create an issue in the repository.

## 🙏 Acknowledgments

- Three.js for 3D rendering
- Trimesh for STL analysis
- Razorpay for payment processing
