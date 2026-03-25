const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id:          { type: Number, unique: true, required: true },
  emoji:       { type: String, default: '📦' },
  category:    { type: String, required: true },
  bgCategory:  { type: String },
  price:       { type: Number, required: true },
  image:       { type: String },
  name:        { type: String, required: true },
  nameEn:      { type: String },
  desc:        { type: String },
  descEn:      { type: String },
  badge:       { type: String },
  badgeEn:     { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
