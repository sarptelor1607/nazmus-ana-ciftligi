const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: Number,
  name:      String,
  nameEn:    String,
  emoji:     String,
  price:     Number,
  qty:       Number,
});

const orderSchema = new mongoose.Schema({
  userId:       { type: String, required: true },
  userEmail:    { type: String },
  items:        [orderItemSchema],
  total:        { type: Number, required: true },
  currency:     { type: String, default: 'TRY' },
  paypalOrderId:{ type: String },
  status:       { type: String, default: 'completed' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
