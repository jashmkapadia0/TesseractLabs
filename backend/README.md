# Backend API - 3D Lab

Node.js Express backend API for the 3D Printing Farm application with MongoDB and Razorpay integration.

## Features

- STL file upload and storage
- Integration with Python analysis service
- Automatic price calculation
- Razorpay payment processing
- Order management
- WhatsApp order sharing
- Admin statistics

## API Endpoints

### Upload
- `POST /api/upload` - Upload STL file and get price calculation

### Payment
- `POST /api/razorpay/create-order` - Create Razorpay payment order
- `POST /api/payment/verify` - Verify payment signature
- `POST /api/payment/webhook` - Handle Razorpay webhooks

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order
- `DELETE /api/orders/:id` - Delete order
- `GET /api/orders/analytics/stats` - Get statistics

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials

# Run development server
npm run dev

# Run production server
npm start
```

## Environment Variables

See `.env.example` for required configuration.

## Docker

```bash
docker build -t 3dlab-backend .
docker run -p 5000:5000 --env-file .env 3dlab-backend
```
