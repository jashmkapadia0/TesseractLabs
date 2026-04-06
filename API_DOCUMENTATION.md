# API Documentation - 3D Lab

Complete API reference for the 3D Printing Farm backend.

## Base URL

- Development: `http://localhost:5000`
- Production: `https://your-domain.com`

## Authentication

Currently, the API does not require authentication. For production, implement JWT or OAuth.

---

## Endpoints

### Health Check

#### `GET /health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "3D Lab Backend API",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

---

### Upload STL File

#### `POST /api/upload`

Upload an STL file for analysis and pricing.

**Request:**
- Content-Type: `multipart/form-data`
- Body parameter: `file` (STL file, max 100MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "65c1234567890abcdef12345",
    "filename": "model.stl",
    "volume": 12500.5,
    "grams": 15.5,
    "price": 107.75,
    "boundingBox": {
      "width": 50.0,
      "depth": 40.0,
      "height": 30.0
    },
    "machineTimeEstimate": 1.5,
    "isWatertight": true,
    "breakdown": {
      "materialCost": 7.75,
      "machineCost": 150.0,
      "handlingFee": 15.78
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (no file, invalid file type)
- `500` - Server error

---

### Create Payment Order

#### `POST /api/razorpay/create-order`

Create a Razorpay order for payment.

**Request:**
```json
{
  "orderId": "65c1234567890abcdef12345"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_MNqr8xYz3gHijk",
    "amount": 10775,
    "currency": "INR",
    "orderId": "65c1234567890abcdef12345"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Order not found"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing orderId)
- `404` - Order not found
- `500` - Server error

---

### Verify Payment

#### `POST /api/payment/verify`

Verify Razorpay payment signature.

**Request:**
```json
{
  "orderId": "65c1234567890abcdef12345",
  "razorpay_payment_id": "pay_MNqr8xYz3gHijk",
  "razorpay_order_id": "order_MNqr8xYz3gHijk",
  "razorpay_signature": "abc123def456..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "65c1234567890abcdef12345",
    "payment_status": "completed"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid payment signature"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request or invalid signature
- `404` - Order not found
- `500` - Server error

---

### Get All Orders

#### `GET /api/orders`

Retrieve all orders with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by payment status (`pending`, `completed`, `failed`)
- `limit` (optional, default: 50): Number of orders to return
- `skip` (optional, default: 0): Number of orders to skip

**Examples:**
- `/api/orders` - Get all orders
- `/api/orders?status=completed` - Get completed orders
- `/api/orders?limit=10&skip=20` - Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65c1234567890abcdef12345",
      "filename": "model-1234567890.stl",
      "originalName": "model.stl",
      "volume": 12500.5,
      "grams": 15.5,
      "price": 107.75,
      "boundingBox": {
        "width": 50.0,
        "depth": 40.0,
        "height": 30.0
      },
      "surfaceArea": 8500.0,
      "isWatertight": true,
      "payment_status": "completed",
      "razorpayOrderId": "order_MNqr8xYz3gHijk",
      "razorpayPaymentId": "pay_MNqr8xYz3gHijk",
      "filePath": "/uploads/model-1234567890.stl",
      "machineTimeEstimate": 1.5,
      "createdAt": "2026-02-12T10:30:00.000Z",
      "updatedAt": "2026-02-12T10:35:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "skip": 0,
    "hasMore": true
  }
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Get Single Order

#### `GET /api/orders/:id`

Get details of a specific order including WhatsApp link.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65c1234567890abcdef12345",
    "filename": "model-1234567890.stl",
    "originalName": "model.stl",
    "volume": 12500.5,
    "grams": 15.5,
    "price": 107.75,
    "payment_status": "completed",
    "createdAt": "2026-02-12T10:30:00.000Z",
    "whatsappLink": "https://wa.me/919876543210?text=I%20want%20to%20print..."
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Order not found
- `500` - Server error

---

### Get Order Statistics

#### `GET /api/orders/analytics/stats`

Get aggregated statistics for all orders.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "completedOrders": 120,
    "pendingOrders": 25,
    "failedOrders": 5,
    "totalRevenue": 16275.50,
    "totalMaterialGrams": 1850.25
  }
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Delete Order

#### `DELETE /api/orders/:id`

Delete a specific order (admin only - implement authentication in production).

**Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `404` - Order not found
- `500` - Server error

---

## Python Service API

### Health Check

#### `GET /health`

Check if the Python service is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "STL Analysis Service"
}
```

---

### Analyze STL File

#### `POST /analyze`

Analyze an STL file and return volume, dimensions, and material estimates.

**Request:**
- Content-Type: `multipart/form-data`
- Body parameter: `file` (STL file)

**Response:**
```json
{
  "volume": 12500.5,
  "estimated_grams": 15.5,
  "bounding_box": {
    "width": 50.0,
    "depth": 40.0,
    "height": 30.0
  },
  "surface_area": 8500.0,
  "is_watertight": true,
  "vertex_count": 1024,
  "face_count": 2048
}
```

**Error Response:**
```json
{
  "error": "No file provided"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (no file, invalid file type)
- `500` - Server error

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `413` - Payload Too Large (file size exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

Currently not implemented. For production, add rate limiting using `express-rate-limit`.

Recommended limits:
- Upload endpoint: 10 requests per IP per hour
- Payment endpoints: 30 requests per IP per hour
- Read endpoints: 100 requests per IP per minute

---

## CORS

CORS is enabled for all origins in development. For production, configure specific origins in `backend/src/server.js`:

```javascript
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));
```

---

## Webhooks

### Razorpay Webhook

#### `POST /api/payment/webhook`

Handle Razorpay payment webhooks.

**Headers:**
- `x-razorpay-signature`: Webhook signature for verification

**Request Body:**
Razorpay webhook payload (varies by event type)

**Events Handled:**
- `payment.captured` - Payment successful
- `payment.failed` - Payment failed

**Response:**
```json
{
  "status": "ok"
}
```

---

## Testing

### cURL Examples

**Upload STL file:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@model.stl"
```

**Get all orders:**
```bash
curl http://localhost:5000/api/orders
```

**Get order statistics:**
```bash
curl http://localhost:5000/api/orders/analytics/stats
```

### Postman Collection

Import the API into Postman using the base URL and create requests for each endpoint.

---

## Security Considerations

### For Production:

1. **Authentication**: Implement JWT or OAuth for protected endpoints
2. **Rate Limiting**: Prevent abuse with rate limiters
3. **Input Validation**: Validate all inputs with libraries like `joi`
4. **HTTPS**: Use SSL/TLS for all communications
5. **CORS**: Restrict to specific origins
6. **File Validation**: Strict file type and size checks
7. **SQL Injection**: Use parameterized queries (MongoDB handles this)
8. **XSS Protection**: Sanitize user inputs
9. **Secrets**: Use environment variables, never hardcode
10. **Logging**: Implement proper logging and monitoring

---

## Pricing Calculation

The price is calculated using this formula:

```
Material Cost = grams × COST_PER_GRAM
Machine Cost = hours × HOURLY_RATE
Handling Fee = (Material Cost + Machine Cost) × 0.10
Total Price = Material Cost + Machine Cost + Handling Fee
```

Default values:
- `COST_PER_GRAM`: ₹0.5
- `HOURLY_RATE`: ₹100
- `Handling Fee`: 10%

Machine time estimate: `hours = grams × 6 / 60`

---

## MongoDB Schema

### Order Collection

```javascript
{
  _id: ObjectId,
  filename: String,           // Stored filename
  originalName: String,       // Original upload filename
  volume: Number,             // Volume in mm³
  grams: Number,              // Estimated material weight
  price: Number,              // Total price
  boundingBox: {
    width: Number,
    depth: Number,
    height: Number
  },
  surfaceArea: Number,
  isWatertight: Boolean,
  payment_status: String,     // 'pending', 'completed', 'failed'
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  filePath: String,
  machineTimeEstimate: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Support

For API issues or questions, contact the development team or create an issue in the repository.
