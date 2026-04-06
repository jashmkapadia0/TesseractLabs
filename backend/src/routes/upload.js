const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Order = require('../models/Order');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = ['.stl', '.obj', '.3mf', '.step', '.stp', '.ply'];
        if (!allowed.includes(ext)) {
            return cb(new Error(`Only 3D files are allowed (${allowed.join(', ')})`));
        }
        cb(null, true);
    }
});

// Pricing configuration
const COST_PER_GRAM = parseFloat(process.env.COST_PER_GRAM) || 0.5;
const HOURLY_RATE = parseFloat(process.env.HOURLY_RATE) || 100;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

/**
 * Calculate estimated machine time based on volume and complexity
 */
function estimateMachineTime(volume, grams) {
    // Rough estimate: 1 gram takes about 6 minutes to print
    // This is a simplified calculation
    const minutes = grams * 6;
    return Math.round(minutes / 60 * 10) / 10; // Convert to hours, round to 1 decimal
}

/**
 * Calculate price based on material and machine time
 */
function calculatePrice(grams, machineTimeHours) {
    const materialCost = grams * COST_PER_GRAM;
    const machineCost = machineTimeHours * HOURLY_RATE;
    const totalPrice = materialCost + machineCost;
    
    // Add 10% handling fee
    const finalPrice = totalPrice * 1.1;
    
    return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
}

/**
 * POST /api/upload
 * Upload STL file and get price calculation
 */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        console.log('📁 File uploaded:', req.file.filename);

        // Send file to Python service for analysis
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        console.log('🔄 Sending to Python service:', PYTHON_SERVICE_URL);

        const pythonResponse = await axios.post(
            `${PYTHON_SERVICE_URL}/analyze`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 30000 // 30 second timeout
            }
        );

        const analysisData = pythonResponse.data;
        console.log('✅ Analysis complete:', analysisData);

        // Calculate machine time and price
        const machineTimeHours = estimateMachineTime(
            analysisData.volume,
            analysisData.estimated_grams
        );
        const price = calculatePrice(analysisData.estimated_grams, machineTimeHours);

        // Create order in database
        const order = new Order({
            filename: req.file.filename,
            originalName: req.file.originalname,
            volume: analysisData.volume,
            grams: analysisData.estimated_grams,
            price: price,
            boundingBox: analysisData.bounding_box,
            surfaceArea: analysisData.surface_area,
            isWatertight: analysisData.is_watertight,
            filePath: `/uploads/${req.file.filename}`,
            machineTimeEstimate: machineTimeHours,
            payment_status: 'pending'
        });

        await order.save();
        console.log('💾 Order saved:', order._id);

        // Return response
        res.json({
            success: true,
            data: {
                orderId: order._id,
                filename: req.file.originalname,
                volume: analysisData.volume,
                grams: analysisData.estimated_grams,
                price: price,
                boundingBox: analysisData.bounding_box,
                machineTimeEstimate: machineTimeHours,
                isWatertight: analysisData.is_watertight,
                breakdown: {
                    materialCost: Math.round(analysisData.estimated_grams * COST_PER_GRAM * 100) / 100,
                    machineCost: Math.round(machineTimeHours * HOURLY_RATE * 100) / 100,
                    handlingFee: Math.round((analysisData.estimated_grams * COST_PER_GRAM + machineTimeHours * HOURLY_RATE) * 0.1 * 100) / 100
                }
            }
        });

    } catch (error) {
        console.error('❌ Upload error:', error);

        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Determine error message
        let errorMessage = 'Error processing file';
        if (error.response) {
            errorMessage = error.response.data.error || errorMessage;
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Python analysis service is not available';
        } else {
            errorMessage = error.message;
        }

        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});

module.exports = router;
