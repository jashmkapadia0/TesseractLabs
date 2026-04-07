from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import trimesh
import os
from werkzeug.utils import secure_filename
import tempfile
import logging
import uuid
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import cascadio

# Add file handler for persistent logs
file_handler = logging.FileHandler('app_debug.log')
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)

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
        
        # Retrieve parameters or use defaults
        density = float(request.form.get('density', FILAMENT_DENSITY))
        infill = float(request.form.get('infill', 20)) / 100.0  # e.g., 20% -> 0.2
        
        try:
            logger.info(f"Loading {ext.upper()} file: {file.filename}")
            
            glb_bytes_for_preview = None  # will be set for STEP files
            
            if ext in ['step', 'stp']:
                # Use cascadio to convert STEP → GLB, then load GLB for analysis
                try:
                    abs_in = os.path.abspath(temp_path)
                    abs_out = os.path.abspath(temp_path + ".glb")
                    
                    logger.info(f"Converting STEP {abs_in} to GLB {abs_out}")
                    # cascadio.step_to_glb takes (input_path, output_path)
                    ret_code = cascadio.step_to_glb(abs_in, abs_out)
                    logger.info(f"cascadio returned code: {ret_code}")
                    
                    if os.path.exists(abs_out):
                        with open(abs_out, 'rb') as f:
                            glb_bytes_for_preview = f.read()
                        
                        # Load generated GLB with explicit type
                        mesh = trimesh.load(io.BytesIO(glb_bytes_for_preview), file_type='glb')
                        logger.info(f"STEP file successfully converted and loaded as mesh: {type(mesh)}")
                        
                        # Cleanup temp GLB
                        try: os.remove(abs_out) 
                        except: pass
                    else:
                        raise RuntimeError(f"cascadio conversion failed (code {ret_code}). Output file not generated.")

                except Exception as casc_e:
                    import traceback
                    logger.error(f"cascadio STEP conversion failed for {file.filename}: {str(casc_e)}")
                    logger.error(traceback.format_exc())
                    raise casc_e
            else:
                # Load the file using trimesh directly
                mesh = trimesh.load(temp_path)
            
            # Merge scene/geometries
            if isinstance(mesh, trimesh.Scene):
                mesh = mesh.dump(concatenate=True) if hasattr(mesh, 'dump') else list(mesh.geometry.values())[0]

            # Get dimensions and units correction
            bounds = mesh.bounds
            dimensions = bounds[1] - bounds[0] # [W, D, H]
            
            # If dimensions are tiny (e.g. < 1.0 total), it's probably in METERS
            if max(dimensions) < 1.0:
                logger.info("Model is very small, scaling by 1000 (m -> mm)")
                mesh.apply_scale(1000.0)
                bounds = mesh.bounds
                dimensions = bounds[1] - bounds[0]
            # If dimensions are small (e.g. < 10 total), maybe it's in INCHES?
            # We'll stick to a heuristic: most standard prints are 10mm - 300mm.
            elif max(dimensions) < 5.0:
                 logger.info("Model is very small, scaling by 25.4 (in -> mm)")
                 mesh.apply_scale(25.4)
                 bounds = mesh.bounds
                 dimensions = bounds[1] - bounds[0]

            # Final dimensions
            width_mm, depth_mm, height_mm = dimensions
            
            # Robust volume calculation
            volume_mm3 = mesh.volume
            if not mesh.is_watertight or volume_mm3 <= 1.0:
                # Use bounding box volume scaled by 0.5 as a rough proxy for "complex" models
                # Or better, convex hull
                try:
                    hull_vol = mesh.convex_hull.volume
                except:
                    hull_vol = 0
                
                # Heuristic: Volume is usually 10-50% of bounding box
                bbox_vol = width_mm * depth_mm * height_mm
                volume_mm3 = max(volume_mm3, hull_vol, bbox_vol * 0.3)

            # Weight calculation
            volume_cm3 = volume_mm3 / 1000.0
            weight_g = volume_cm3 * density * infill
            
            # Print Time (hrs): 
            # Simple heuristic matching the frontend's logic
            print_time_hours = (weight_g * 0.05) + (height_mm * 0.005)
            
            # Pricing Model (matching or exceeding frontend)
            cost_per_gram = 1.0
            cost_per_hour = 30.0
            price = ((weight_g * cost_per_gram) + (print_time_hours * cost_per_hour)) * 1.5
            price = max(price, 15.0) # Absolute minimum ₹15
            
            logger.info(f"Final analyzed values: {width_mm:.1f}x{depth_mm:.1f}x{height_mm:.1f}mm, Vol: {volume_mm3:.1f}, Price: {price:.1f}")

            
            # Save GLB for preview
            converted_glb_url = None
            
            # Use EXTERNAL_API_URL if this is running in production, else fallback to localhost
            host = os.getenv('EXTERNAL_API_URL', 'http://localhost:5000')
            
            if glb_bytes_for_preview is not None:
                # Already have GLB bytes from cascadio STEP conversion
                converted_filename = f"{uuid.uuid4().hex}.glb"
                converted_path = os.path.join(UPLOAD_FOLDER, converted_filename)
                with open(converted_path, 'wb') as f:
                    f.write(glb_bytes_for_preview)
                converted_glb_url = f"{host}/uploads/{converted_filename}"
                logger.info(f"STEP→GLB saved: {converted_glb_url}")
            
            # Calculate surface area
            surface_area = mesh.area
            
            # Check if mesh is watertight
            is_watertight = mesh.is_watertight
            
            logger.info(f"Analysis complete: Volume={volume_mm3:.2f}mm³, Weight={weight_g:.2f}g, Price=₹{price:.2f}")
            
            # Prepare response
            response = {
                'volume': round(volume_mm3, 2),
                'grams': round(weight_g, 2),
                'estimated_time_hours': round(print_time_hours, 2),
                'price': round(price, 2),
                'converted_glb_url': converted_glb_url,
                'bounding_box': {
                    'width': round(width_mm, 2),
                    'depth': round(depth_mm, 2),
                    'height': round(height_mm, 2)
                },
                'surface_area': round(mesh.area, 2),
                'is_watertight': mesh.is_watertight,
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

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with service information"""
    return jsonify({
        'service': '3D Lab STL Analysis Service',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/analyze': 'POST - Analyze STL file (multipart/form-data with "file" field)',
            '/slice': 'POST - Trigger background slicing job (form-data with "file", "orderId", "infill", "material")',
            '/uploads/<filename>': 'GET - Get converted GLB files'
        }
    }), 200

@app.route('/slice', methods=['POST'])
def run_slice_job():
    """Trigger background slicing job"""
    try:
        from celery_worker import slice_model_task
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        order_id = request.form.get('orderId')
        
        if not order_id:
            return jsonify({'error': 'No orderId provided'}), 400
            
        infill = int(request.form.get('infill', 20))
        material = request.form.get('material', 'pla')
        
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        # Save file persistently in uploads dir for the celery worker
        filename = secure_filename(f"{order_id}_{file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Dispatch celery task
        slice_model_task.delay(file_path, order_id, infill, material)
        
        return jsonify({
            'success': True,
            'message': 'Slicing job queued successfully',
            'orderId': order_id
        }), 202
        
    except Exception as e:
        logger.error(f"Error queueing slice job: {str(e)}")
        return jsonify({'error': str(e)}), 500

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
