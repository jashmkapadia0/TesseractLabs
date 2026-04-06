from flask import Flask, request, jsonify
from flask_cors import CORS
import trimesh
import os
from werkzeug.utils import secure_filename
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'stl', 'obj', '3mf', 'step', 'stp', 'ply'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
FILAMENT_DENSITY = float(os.getenv('FILAMENT_DENSITY', 1.24))  # g/cm³ for PLA

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_filament_usage(volume_mm3, density=FILAMENT_DENSITY):
    """
    Calculate estimated filament weight in grams
    
    Args:
        volume_mm3: Volume in cubic millimeters
        density: Filament density in g/cm³
    
    Returns:
        float: Estimated weight in grams
    """
    # Convert mm³ to cm³ (1 cm³ = 1000 mm³)
    volume_cm3 = volume_mm3 / 1000.0
    
    # Calculate weight in grams
    # Adding 15% infill factor (typical for 3D prints)
    weight = volume_cm3 * density * 0.15
    
    return round(weight, 2)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': '3D Model Analysis Service'
    }), 200

@app.route('/analyze', methods=['POST'])
def analyze_model():
    """
    Analyze 3D model file and return volume, dimensions, and material estimates
    """
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'error': 'No file selected'
            }), 400
        
        # Validate file extension
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({
                'error': f'Invalid file type. Allowed: {", ".join(map(str.upper, ALLOWED_EXTENSIONS))}'
            }), 400
        
        # Create a temporary file to store the uploaded model
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{ext}') as temp_file:
            temp_path = temp_file.name
            file.save(temp_path)
        
        try:
            # Load the file using trimesh
            logger.info(f"Loading {ext.upper()} file: {file.filename}")
            mesh = trimesh.load(temp_path)
            
            # If it's a scene or multiple meshes, merge them or analyze primary
            if isinstance(mesh, trimesh.Scene):
                if len(mesh.geometry) == 0:
                    raise ValueError("Empty 3D scene")
                # Merge scene into a single mesh for simple analysis
                mesh = mesh.dump(concatenate=True) if hasattr(mesh, 'dump') else list(mesh.geometry.values())[0]

            # Calculate volume in mm³
            volume_mm3 = mesh.volume
            
            # If volume is negative or invalid (typical for non-watertight or open meshes)
            if volume_mm3 < 0 or mesh.is_empty:
                # Fallback: compute convex hull volume or bounding box proxy if volume is 0
                volume_mm3 = mesh.convex_hull.volume if mesh.convex_hull else 0
            
            # Get bounding box dimensions
            bounds = mesh.bounds
            dimensions = bounds[1] - bounds[0]  # [width, depth, height]
            
            # Calculate estimated filament usage
            estimated_grams = calculate_filament_usage(volume_mm3, FILAMENT_DENSITY)
            
            # Calculate surface area
            surface_area = mesh.area
            
            # Check if mesh is watertight
            is_watertight = mesh.is_watertight
            
            logger.info(f"Analysis complete: Volume={volume_mm3:.2f}mm³, Weight={estimated_grams}g")
            
            # Prepare response
            response = {
                'volume': round(volume_mm3, 2),
                'estimated_grams': estimated_grams,
                'bounding_box': {
                    'width': round(dimensions[0], 2),
                    'depth': round(dimensions[1], 2),
                    'height': round(dimensions[2], 2)
                },
                'surface_area': round(surface_area, 2),
                'is_watertight': is_watertight,
                'vertex_count': len(mesh.vertices),
                'face_count': len(mesh.faces),
                'format': ext.upper()
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            logger.error(f"Error processing {ext.upper()} file: {str(e)}")
            return jsonify({
                'error': f'Error processing {ext.upper()} file: {str(e)}'
            }), 500
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': f'Unexpected error: {str(e)}'
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with service information"""
    return jsonify({
        'service': '3D Lab STL Analysis Service',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/analyze': 'POST - Analyze STL file (multipart/form-data with "file" field)'
        }
    }), 200

@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    return jsonify({
        'error': 'File too large. Maximum size is 100MB'
    }), 413

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal error: {str(error)}")
    return jsonify({
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
