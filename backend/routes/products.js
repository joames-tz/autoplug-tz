const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// GET all active products
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({ active: true }).sort('-createdAt');
    res.json(products);
  } catch (err) { next(err); }
});

// GET single product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

// GET list of unique categories
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { active: true });
    res.json(categories);
  } catch (err) { next(err); }
});

// GET list of unique car brands
router.get('/meta/brands', async (req, res, next) => {
  try {
    const brands = await Product.distinct('carBrand', { active: true });
    res.json(brands);
  } catch (err) { next(err); }
});

module.exports = router;