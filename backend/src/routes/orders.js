const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

/**
 * GET /api/orders
 * Get all orders with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const { status, limit = 50, skip = 0 } = req.query;

        // Build query
        const query = {};
        if (status) {
            query.payment_status = status;
        }

        // Get orders
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        // Get total count
        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: total > (parseInt(skip) + parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
});

/**
 * GET /api/orders/:id
 * Get a specific order by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Include WhatsApp link
        const whatsappNumber = process.env.WHATSAPP_NUMBER;
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${order.whatsappMessage}`;

        res.json({
            success: true,
            data: {
                ...order.toObject(),
                whatsappLink
            }
        });

    } catch (error) {
        console.error('❌ Error fetching order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order'
        });
    }
});

/**
 * DELETE /api/orders/:id
 * Delete an order (admin only - add authentication in production)
 */
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete order'
        });
    }
});

/**
 * GET /api/orders/stats
 * Get order statistics
 */
router.get('/analytics/stats', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ payment_status: 'completed' });
        const pendingOrders = await Order.countDocuments({ payment_status: 'pending' });
        const failedOrders = await Order.countDocuments({ payment_status: 'failed' });

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { payment_status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Calculate total material used
        const materialResult = await Order.aggregate([
            { $match: { payment_status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$grams' } } }
        ]);
        const totalMaterial = materialResult.length > 0 ? materialResult[0].total : 0;

        res.json({
            success: true,
            data: {
                totalOrders,
                completedOrders,
                pendingOrders,
                failedOrders,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalMaterialGrams: Math.round(totalMaterial * 100) / 100
            }
        });

    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;
