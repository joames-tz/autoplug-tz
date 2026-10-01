require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

const app = express();
const server = http.createServer(app);

// ============ MIDDLEWARE ============
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use('/api', rateLimit({ windowMs: 60_000, max: 300 }));

// ============ API ROUTES ============
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    business: process.env.BUSINESS_NAME || 'AutoPlug Tz',
    time: new Date().toISOString()
  });
});

// ============ SERVE FRONTEND ============
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ============ ERROR HANDLER ============
app.use(errorHandler);

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 ${process.env.BUSINESS_NAME || 'AutoPlug Tz'} running at http://localhost:${PORT}`);
    console.log(`👑 Admin panel: http://localhost:${PORT}/admin`);
  });
});