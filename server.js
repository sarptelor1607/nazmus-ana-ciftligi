require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');

const app       = express();
const PORT      = process.env.PORT      || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nazmuss';

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));   // statik dosyaları sun

// ── API Routes ──────────────────────────────────────────────
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));

// ── Catch-all: SPA fallback ─────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── MongoDB + Server ────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB bağlantısı kuruldu');
    app.listen(PORT, () =>
      console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });
