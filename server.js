require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ ENABLE CORS FIRST
app.use(cors({
  origin: ['https://food-court-hub.web.app', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIREBASE ADMIN SETUP
// ✅ FIREBASE ADMIN SETUP
let db;
try {
  const serviceAccount = require('./serviceAccountKey.json');
  
  // Validate it has required fields
  if (!serviceAccount.type || !serviceAccount.project_id) {
    throw new Error('serviceAccountKey.json is missing required fields');
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  
  db = admin.firestore();
  console.log('✅ Firebase Admin initialized');
  console.log('📊 Project:', serviceAccount.project_id);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('💡 Make sure serviceAccountKey.json exists and is valid JSON');
  process.exit(1);
}

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🍽️ FoodCourt API is running' });
});

// ✅ POST /api/orders - Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Generate order ID
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    
    console.log('📝 Saving order:', orderId, orderData);
    
    // Save to Firestore
    await db.collection('orders').doc(orderId).set({
      ...orderData,
      status: 'ordered',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Order saved:', orderId);
    res.json({ success: true, orderId: orderId, message: 'Order saved successfully' });
  } catch (error) {
    console.error('❌ Error saving order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ GET /api/orders/table/:table - Get orders by table
app.get('/api/orders/table/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const snapshot = await db.collection('orders').where('table', '==', table).get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, orders: orders });
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ GET /api/orders/restaurant/:restaurant - Get orders by restaurant
app.get('/api/orders/restaurant/:restaurant', async (req, res) => {
  try {
    const { restaurant } = req.params;
    const snapshot = await db.collection('orders').where('restaurant', '==', restaurant).get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, orders: orders });
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ GET /api/orders/active - Get all active orders
app.get('/api/orders/active', async (req, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('status', 'in', ['ordered', 'preparing', 'ready'])
      .get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, orders: orders });
  } catch (error) {
    console.error('❌ Error getting active orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ PATCH /api/orders/:id/status - Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`📝 Updating order ${id} to ${status}`);
    
    await db.collection('orders').doc(id).update({
      status: status,
      updatedAt: new Date()
    });
    
    console.log(`✅ Order ${id} updated to ${status}`);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ GET /api/orders/:id - Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('orders').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, order: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('❌ Error getting order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Serve static files LAST
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🍽️ FoodCourt Hub API running on http://localhost:${PORT}`);
  console.log(`📊 Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'food-court-hub'}`);
});