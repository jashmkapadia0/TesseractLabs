# Architecture Overview - 3D Lab

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                      http://localhost:5173                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Home Page   │  │  Upload Page │  │    Orders Page       │  │
│  │              │  │              │  │                      │  │
│  │ - Hero       │  │ - File Input │  │ - Order List        │  │
│  │ - Features   │  │ - 3D Viewer  │  │ - Filter Status     │  │
│  │ - CTA        │  │ - Payment    │  │ - Statistics        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  Components:                                                     │
│  ├── Navbar                                                     │
│  ├── STLViewer (Three.js)                                       │
│  └── API Client (Axios)                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                        │
│                 http://localhost:5000                           │
│                                                                  │
│  Routes:                                                         │
│  ├── POST /api/upload          (File Upload)                    │
│  ├── POST /api/razorpay/create-order  (Payment)                │
│  ├── POST /api/payment/verify  (Verify Payment)                │
│  ├── GET  /api/orders          (List Orders)                   │
│  └── GET  /api/orders/:id      (Single Order)                  │
│                                                                  │
│  Middleware:                                                     │
│  ├── CORS                                                       │
│  ├── Multer (File Upload)                                       │
│  ├── Body Parser                                                │
│  └── Error Handler                                              │
└─────────┬────────────────────────────┬──────────────────────────┘
          │                            │
          │                            │ HTTP
          │                            ▼
          │              ┌──────────────────────────────────┐
          │              │  PYTHON SERVICE (Flask)          │
          │              │  http://localhost:5001           │
          │              │                                  │
          │              │  POST /analyze                   │
          │              │  - Load STL with Trimesh        │
          │              │  - Calculate volume             │
          │              │  - Extract dimensions           │
          │              │  - Estimate material            │
          │              │  - Return analysis data         │
          │              └──────────────────────────────────┘
          │
          │ Mongoose ODM
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB (Database)                           │
│                  mongodb://localhost:27017                      │
│                                                                  │
│  Collections:                                                    │
│  └── orders                                                     │
│      ├── _id                                                    │
│      ├── filename                                               │
│      ├── volume                                                 │
│      ├── grams                                                  │
│      ├── price                                                  │
│      ├── payment_status                                         │
│      └── timestamps                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Upload STL
     ▼
┌──────────────────┐
│   Frontend       │
│  (Upload Page)   │
└────┬─────────────┘
     │ 2. POST /api/upload (multipart/form-data)
     ▼
┌──────────────────┐
│   Backend        │
│  (upload.js)     │
└────┬─────────────┘
     │ 3. Save file to disk
     │ 4. Forward to Python Service
     ▼
┌──────────────────┐
│ Python Service   │
│   (app.py)       │
│                  │
│ • Load STL       │
│ • Analyze mesh   │
│ • Calculate      │
└────┬─────────────┘
     │ 5. Return analysis data
     ▼
┌──────────────────┐
│   Backend        │
│  (upload.js)     │
│                  │
│ • Calculate price│
│ • Save to DB     │
└────┬─────────────┘
     │ 6. Return quote
     ▼
┌──────────────────┐
│   Frontend       │
│  (Upload Page)   │
│                  │
│ • Show 3D viewer │
│ • Display price  │
│ • Show payment   │
└────┬─────────────┘
     │ 7. User clicks "Pay"
     ▼
┌──────────────────┐
│   Razorpay       │
│ Payment Gateway  │
└────┬─────────────┘
     │ 8. Payment complete
     ▼
┌──────────────────┐
│   Backend        │
│  (payment.js)    │
│                  │
│ • Verify signature│
│ • Update status  │
└──────────────────┘
```

## Technology Stack Details

### Frontend Layer
```
React 18
├── Routing: React Router v6
├── Styling: Tailwind CSS
├── 3D Graphics: Three.js
│   ├── STLLoader
│   └── OrbitControls
├── HTTP Client: Axios
├── Build Tool: Vite
└── Icons: React Icons
```

### Backend Layer
```
Node.js + Express
├── Database: MongoDB + Mongoose
├── File Upload: Multer
├── Payment: Razorpay SDK
├── HTTP Client: Axios
├── CORS: cors middleware
└── Environment: dotenv
```

### Python Service Layer
```
Flask
├── STL Processing: Trimesh
├── Math: NumPy
├── CORS: flask-cors
└── Environment: python-dotenv
```

### DevOps Layer
```
Docker Compose
├── MongoDB Container
├── Python Service Container
├── Backend Container
├── Frontend Container
└── Shared Network
```

## Component Interaction

### Upload Flow
```
User Action: Select STL file
     ↓
STLViewer Component: Display 3D preview
     ↓
Upload Handler: Send to backend
     ↓
Backend: Forward to Python service
     ↓
Python: Analyze and return data
     ↓
Backend: Calculate price, save order
     ↓
Frontend: Display results
```

### Payment Flow
```
User Action: Click "Pay via Razorpay"
     ↓
Backend: Create Razorpay order
     ↓
Frontend: Open Razorpay modal
     ↓
User: Complete payment
     ↓
Razorpay: Return payment details
     ↓
Backend: Verify signature
     ↓
Backend: Update order status
     ↓
Frontend: Show success message
```

## Security Architecture

```
┌─────────────────────────────────────────────┐
│          Security Layers                    │
├─────────────────────────────────────────────┤
│ 1. Frontend Validation                       │
│    - File type check                         │
│    - File size limit                         │
│                                              │
│ 2. Backend Validation                        │
│    - File extension check                    │
│    - MIME type verification                  │
│    - Size limit enforcement                  │
│                                              │
│ 3. Payment Security                          │
│    - Razorpay signature verification         │
│    - Environment variable secrets            │
│                                              │
│ 4. Database                                  │
│    - Mongoose validation                     │
│    - Input sanitization                      │
│                                              │
│ 5. Network                                   │
│    - CORS configuration                      │
│    - Docker network isolation                │
└─────────────────────────────────────────────┘
```

## Deployment Architecture

### Development (Current)
```
Local Machine
├── Docker Desktop
    ├── MongoDB (27017)
    ├── Python Service (5001)
    ├── Backend (5000)
    └── Frontend (5173)
```

### Production (Recommended)
```
Cloud Infrastructure
├── Load Balancer (HTTPS)
    ├── Frontend (Static CDN)
    ├── Backend (Auto-scaling)
    │   ├── Instance 1
    │   ├── Instance 2
    │   └── Instance N
    ├── Python Service (Auto-scaling)
    └── MongoDB (Managed cluster)
        ├── Primary
        ├── Secondary
        └── Arbiter
```

## File Structure Architecture

```
3DLab/
├── Configuration Files
│   ├── docker-compose.yml
│   ├── .gitignore
│   └── .env files
│
├── Documentation
│   ├── README.md
│   ├── SETUP_GUIDE.md
│   ├── API_DOCUMENTATION.md
│   ├── PROJECT_STRUCTURE.md
│   ├── GETTING_STARTED.md
│   └── FEATURES.md
│
├── Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── Configuration
│
├── Backend (Node.js)
│   └── src/
│       ├── models/
│       └── routes/
│
└── Python Service (Flask)
    └── app.py
```

## API Architecture

```
REST API Endpoints

Upload Service
├── POST /api/upload
    └── Returns: Order with price

Payment Service
├── POST /api/razorpay/create-order
├── POST /api/payment/verify
└── POST /api/payment/webhook

Order Service
├── GET  /api/orders
├── GET  /api/orders/:id
├── DELETE /api/orders/:id
└── GET  /api/orders/analytics/stats

Python Analysis Service
└── POST /analyze
    └── Returns: Volume, dimensions, material
```

## Scaling Strategy

### Horizontal Scaling
```
Load Balancer
├── Backend Instance 1 ──┐
├── Backend Instance 2 ──┤
└── Backend Instance N ──┤
                         ├──→ Shared MongoDB Cluster
Python Service 1 ────────┤
Python Service 2 ────────┤
Python Service N ────────┘
```

### Vertical Scaling
```
Increase Resources:
├── CPU: 2 → 4 → 8 cores
├── RAM: 4GB → 8GB → 16GB
└── Storage: SSD with higher IOPS
```

## Monitoring Architecture

```
Application Layer
├── Backend Logs
├── Python Service Logs
└── Frontend Error Tracking
     ↓
Logging Service (e.g., ELK Stack)
     ↓
Monitoring Dashboard
├── Performance metrics
├── Error rates
├── Response times
└── User analytics
```

## Backup Strategy

```
Regular Backups
├── Database Backups (Daily)
│   └── MongoDB dump to S3
├── File Backups (Daily)
│   └── Uploaded STL files to S3
└── Code Backups (Continuous)
    └── Git repository
```

---

## Summary

This architecture provides:

✅ **Modular Design**: Each service is independent
✅ **Scalability**: Can scale horizontally and vertically
✅ **Maintainability**: Clear separation of concerns
✅ **Security**: Multiple validation layers
✅ **Performance**: Optimized data flow
✅ **Reliability**: Docker containerization
✅ **Developer Experience**: Hot reload, clear documentation
✅ **Production Ready**: Complete deployment setup

The system is designed to handle:
- Multiple concurrent users
- Large file uploads
- Complex 3D calculations
- Secure payment processing
- Real-time updates
