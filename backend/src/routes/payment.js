const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

/**
 * POST /api/razorpay/create-order
 * Create a Razorpay order
 */
router.post('/razorpay/create-order', async (req, res) => {
    try {
        const { orderId, configuredPrice, options: printOptions } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID is required'
            });
        }

        // Get order from database
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Update the order with dynamic pricing and options configured by the user
        if (configuredPrice) {
            order.price = configuredPrice;
        }
        if (printOptions) {
            order.material = printOptions.material;
            order.color = printOptions.color;
            order.infill = printOptions.infill;
            order.qty = printOptions.qty;
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(order.price * 100), // amount in paise
            currency: 'INR',
            receipt: order._id.toString(),
            notes: {
                orderId: order._id.toString(),
                filename: order.originalName,
                volume: order.volume.toString(),
                grams: order.grams.toString(),
                qty: order.qty?.toString() || "1",
                material: order.material || "PLA"
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);
        
        // Update order with Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        console.log('💳 Razorpay order created:', razorpayOrder.id);

        res.json({
            success: true,
            data: {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                orderId: order._id
            }
        });

    } catch (error) {
        console.error('❌ Razorpay order creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment order'
        });
    }
});

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature
 */
router.post('/payment/verify', async (req, res) => {
    try {
        const {
            orderId,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = req.body;

        if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: 'Missing required payment parameters'
            });
        }

        // Get order from database
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            // Payment verified successfully
            order.payment_status = 'completed';
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            await order.save();

            console.log('✅ Payment verified for order:', order._id);

            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    orderId: order._id,
                    payment_status: order.payment_status
                }
            });
        } else {
            // Invalid signature
            order.payment_status = 'failed';
            await order.save();

            console.log('❌ Invalid payment signature for order:', order._id);

            res.status(400).json({
                success: false,
                error: 'Invalid payment signature'
            });
        }

    } catch (error) {
        console.error('❌ Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
        });
    }
});

/**
 * POST /api/payment/webhook
 * Handle Razorpay webhooks (optional)
 */
router.post('/payment/webhook', async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookBody = JSON.stringify(req.body);

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(webhookBody)
            .digest('hex');

        if (webhookSignature === expectedSignature) {
            const event = req.body.event;
            const payload = req.body.payload.payment.entity;

            console.log('📨 Webhook received:', event);

            // Handle different events
            switch (event) {
                case 'payment.captured':
                    // Payment successful
                    const orderId = payload.notes.orderId;
                    if (orderId) {
                        const order = await Order.findById(orderId);
                        if (order) {
                            order.payment_status = 'completed';
                            order.razorpayPaymentId = payload.id;
                            await order.save();
                        }
                    }
                    break;

                case 'payment.failed':
                    // Payment failed
                    const failedOrderId = payload.notes.orderId;
                    if (failedOrderId) {
                        const order = await Order.findById(failedOrderId);
                        if (order) {
                            order.payment_status = 'failed';
                            await order.save();
                        }
                    }
                    break;
            }

            res.json({ status: 'ok' });
        } else {
            res.status(400).json({ error: 'Invalid signature' });
        }

    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router;
