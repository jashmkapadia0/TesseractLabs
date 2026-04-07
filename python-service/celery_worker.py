import os
from celery import Celery
import subprocess
import logging
import re
from pymongo import MongoClient
import tempfile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://mongodb:27017/3dlab')

celery_app = Celery('slicer_tasks', broker=REDIS_URL, backend=REDIS_URL)
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

def update_order_in_db(order_id, updates):
    try:
        from bson import ObjectId
        client = MongoClient(MONGO_URI)
        db = client['3dlab']
        orders_collection = db['orders']
        orders_collection.update_one({'_id': ObjectId(order_id)}, {'$set': updates})
        logger.info(f"Updated order {order_id} with {updates}")
    except Exception as e:
        logger.error(f"Failed to update DB for order {order_id}: {e}")

@celery_app.task(bind=True)
def slice_model_task(self, file_path, order_id, infill=20, material="pla"):
    """
    Run PrusaSlicer in headless mode to slice the file and extract gcode analysis.
    """
    logger.info(f"Starting slice job for file: {file_path}, order: {order_id}")
    
    # Check if file exists
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return {'error': 'File not found'}

    # Generate output gcode path
    temp_gcode = tempfile.NamedTemporaryFile(suffix=".gcode", delete=False).name
    
    try:
        # Run prusa-slicer CLI to generate G-code
        # Example: prusa-slicer -g file.stl --fill-density 20% -o test.gcode
        cmd = [
            "prusa-slicer",
            "-g", file_path,
            "--fill-density", f"{infill}%",
            "-o", temp_gcode
        ]
        
        logger.info(f"Executing: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"PrusaSlicer error: {result.stderr}")
            return {'error': 'Slicing failed', 'stderr': result.stderr}
            
        # Parse the output GCode for metrics
        # PrusaSlicer typically appends comments at the end of the gcode:
        # ; filament used [g] = 12.34
        # ; estimated printing time (normal mode) = 1h 23m 45s
        
        weight_g = None
        print_time_hours = None
        
        with open(temp_gcode, 'r') as f:
            content = f.read()
            
            # Extract weight
            weight_match = re.search(r'; filament used \[g\] = ([\d\.]+)', content)
            if weight_match:
                weight_g = float(weight_match.group(1))
                
            # Extract time
            time_match = re.search(r'; estimated printing time \(normal mode\) = (.*)', content)
            if time_match:
                time_str = time_match.group(1).strip()
                # Parse "1h 23m 45s" into hours
                h_match = re.search(r'(\d+)h', time_str)
                m_match = re.search(r'(\d+)m', time_str)
                s_match = re.search(r'(\d+)s', time_str)
                
                hours = int(h_match.group(1)) if h_match else 0
                minutes = int(m_match.group(1)) if m_match else 0
                seconds = int(s_match.group(1)) if s_match else 0
                
                print_time_hours = hours + (minutes / 60.0) + (seconds / 3600.0)

        # Build updates payload
        updates = {}
        if weight_g is not None:
            updates['grams'] = round(weight_g, 2)
        if print_time_hours is not None:
            updates['machineTimeEstimate'] = round(print_time_hours, 2)
            
        # Recalculate price if we got accurate data
        if weight_g is not None and print_time_hours is not None:
            cost_per_gram = 1.0 # ₹1000/kg
            cost_per_hour = 30.0
            profit_multiplier = 1.5
            price = ((weight_g * cost_per_gram) + (print_time_hours * cost_per_hour)) * profit_multiplier
            updates['price'] = round(price, 2)

        # Publish to MongoDB
        if updates:
            update_order_in_db(order_id, updates)

        logger.info(f"Slicing complete. Extracted: Weight={weight_g}g, Time={print_time_hours}h")
        return updates

    except Exception as e:
        logger.error(f"Error during celery task execution: {str(e)}")
        return {'error': str(e)}
        
    finally:
        # Cleanup temp gcode
        if os.path.exists(temp_gcode):
            os.remove(temp_gcode)
