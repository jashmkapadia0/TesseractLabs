const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    grams: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    boundingBox: {
        width: Number,
        depth: Number,
        height: Number
    },
    surfaceArea: Number,
    isWatertight: Boolean,
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    filePath: String,
    machineTimeEstimate: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Virtual for WhatsApp message
orderSchema.virtual('whatsappMessage').get(function() {
    return `I want to print this model:%0A%0AFile: ${this.originalName}%0AVolume: ${this.volume.toFixed(2)} mm³%0AMaterial: ${this.grams.toFixed(2)} grams%0APrice: ₹${this.price.toFixed(2)}`;
});

module.exports = mongoose.model('Order', orderSchema);
