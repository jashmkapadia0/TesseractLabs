# Frontend - 3D Lab

React + Vite frontend application for the 3D Printing Farm with Three.js STL viewer and Razorpay integration.

## Features

- Modern React 18 with Vite
- Tailwind CSS for styling
- Three.js for 3D STL preview
- Razorpay payment integration
- WhatsApp order sharing
- Responsive design
- Dark theme

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API URL and Razorpay key

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key
- `VITE_WHATSAPP_NUMBER` - WhatsApp number for orders

## Pages

- `/` - Home page with features and CTA
- `/upload` - Upload STL and get quote
- `/orders` - View all orders (admin)

## Components

- `Navbar` - Navigation bar
- `STLViewer` - Three.js 3D model viewer

## Docker

```bash
docker build -t 3dlab-frontend .
docker run -p 5173:5173 3dlab-frontend
```
