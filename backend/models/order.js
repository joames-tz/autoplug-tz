const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  deliveryMethod: { type: String, enum: ['pickup', 'delivery'], required: true },
  deliveryAddress: { type: String, default: '' },      // if delivery
  deliveryDistance: { type: Number, default: null },   // km, if delivery
  deliveryFee: { type: Number, default: 0 },           // delivery charge
  pickupLocation: { type: String, default: 'Dar es Salaam' },
  totalAmount: { type: Number, required: true },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'shipped', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);