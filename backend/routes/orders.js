const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

// POST place a new order (no login required)
router.post('/', async (req, res, next) => {
  try {
    const {
      customerName, customerEmail, customerPhone,
      productId, quantity, deliveryMethod,
      deliveryAddress, deliveryDistance, notes
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }
    if (!productId) {
      return res.status(400).json({ error: 'Product is required' });
    }
    if (!['pickup', 'delivery'].includes(deliveryMethod)) {
      return res.status(400).json({ error: 'Delivery method must be pickup or delivery' });
    }
    if (deliveryMethod === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!product.active) return res.status(400).json({ error: 'Product not available' });

    const qty = Math.max(1, parseInt(quantity) || 1);

    let deliveryFee = 0;
    if (deliveryMethod === 'delivery') {
      const dist = parseFloat(deliveryDistance) || 0;
      deliveryFee = 2000 + Math.max(0, Math.round(dist * 500));
    }

    const productTotal = product.price * qty;
    const totalAmount = productTotal + deliveryFee;

    const order = await Order.create({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      quantity: qty,
      deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress.trim() : '',
      deliveryDistance: deliveryMethod === 'delivery' ? (parseFloat(deliveryDistance) || 0) : null,
      deliveryFee,
      pickupLocation: process.env.BUSINESS_LOCATION || 'Dar es Salaam',
      totalAmount,
      notes: notes?.trim() || '',
      status: 'pending'
    });

    res.json({
      success: true,
      order: {
        id: order._id,
        productName: order.productName,
        quantity: order.quantity,
        deliveryMethod: order.deliveryMethod,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        status: order.status
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;