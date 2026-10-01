const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Order = require('../models/Order');
const adminAuth = require('../middleware/auth');
const { uploadImage, uploadVideo } = require('../services/cloudinary');
const router = express.Router();

// ============ LOGIN ============
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { role: 'admin', username },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
  res.json({ token });
});

// ============ UPLOAD ============
router.post('/upload/image', adminAuth, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  res.json({ url: req.file.path });
});

router.post('/upload/video', adminAuth, uploadVideo.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video uploaded' });
  res.json({ url: req.file.path });
});

// ============ PRODUCTS ============
router.get('/products', adminAuth, async (req, res, next) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.json(products);
  } catch (err) { next(err); }
});

router.post('/products', adminAuth, async (req, res, next) => {
  try {
    const {
      name, description, price, category, carBrand, carModel,
      year, images, video, stock
    } = req.body;

    if (!name || !description || !price || !category || !carBrand) {
      return res.status(400).json({ error: 'Name, description, price, category and car brand are required' });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      carBrand: carBrand.trim(),
      carModel: carModel?.trim() || '',
      year: year?.trim() || '',
      images: Array.isArray(images) ? images : [],
      video: video || null,
      stock: parseInt(stock) || 1,
      active: true
    });

    res.json(product);
  } catch (err) { next(err); }
});

router.patch('/products/:id', adminAuth, async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/products/:id', adminAuth, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ============ ORDERS ============
router.get('/orders', adminAuth, async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('productId', 'name category carBrand images')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) { next(err); }
});

router.patch('/orders/:id', adminAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

// ============ STATS ============
router.get('/stats', adminAuth, async (req, res, next) => {
  try {
    const [products, orders, pending, completed] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' })
    ]);

    const revenueData = await Order.find({ status: 'completed' });
    const revenue = revenueData.reduce((s, o) => s + o.totalAmount, 0);

    res.json({ products, orders, pending, completed, revenue });
  } catch (err) { next(err); }
});

module.exports = router;