# Python Service - STL Analysis Microservice

This Flask-based microservice analyzes STL files using the Trimesh library to calculate volume, dimensions, and estimated material usage for 3D printing.

## Features

- STL file parsing and analysis
- Volume calculation in mm³
- Bounding box dimensions
- Estimated filament weight calculation
- Mesh validation (watertight check)
- Surface area calculation

## API Endpoints

### Health Check
```http
GET /health
```

### Analyze STL File
```http
POST /analyze
Content-Type: multipart/form-data

Body:
  file: <STL file>

Response:
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

## Local Development

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

## Configuration

Edit `.env` file:
```
FLASK_PORT=5001
FILAMENT_DENSITY=1.24
```

## Docker

```bash
docker build -t 3dlab-python-service .
docker run -p 5001:5001 3dlab-python-service
```
