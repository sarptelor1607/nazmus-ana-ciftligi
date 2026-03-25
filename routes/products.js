const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');

// GET /api/products  — list all (supports ?search= and ?category= filters)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};
    if (search)                        query.name = { $regex: search, $options: 'i' };
    if (category && category !== 'all') query.category = category;
    const products = await Product.find(query).sort({ id: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id  — single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products  — create new product (auto-increments id)
router.post('/', async (req, res) => {
  try {
    const last  = await Product.findOne().sort({ id: -1 });
    const newId = last ? last.id + 1 : 1;
    const product = new Product({ ...req.body, id: newId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id  — update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id  — delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
