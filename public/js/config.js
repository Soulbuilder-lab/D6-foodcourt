// public/js/config.js
// Configuration for your Food Court App

// ⚠️ IMPORTANT: Replace this with your actual Railway URL
// Get your URL from: Railway Dashboard → Your Project → Domains
const RAILWAY_URL = 'https://d6-foodcourt-firebasefood-court-hub.up.railway.app';  // ← REPLACE THIS!

// Example:
// const RAILWAY_URL = 'https://foodcourt-production.up.railway.app';

const CONFIG = {
  // Backend API Base URL
  BACKEND_URL: RAILWAY_URL,
  
  // API Endpoints
  API: {
    // Orders
    CREATE_ORDER: '/api/orders',
    GET_ORDER: (orderId) => `/api/orders/${orderId}`,
    GET_TABLE_ORDERS: (table) => `/api/orders/table/${table}`,
    GET_RESTAURANT_ORDERS: (restaurant) => `/api/orders/restaurant/${restaurant}`,
    GET_ACTIVE_ORDERS: '/api/orders/active',
    UPDATE_ORDER_STATUS: (orderId) => `/api/orders/${orderId}/status`,
    DELETE_ORDER: (orderId) => `/api/orders/${orderId}`,
    
    // Auth
    VERIFY_AUTH: '/api/auth/verify',
    
    // Health
    HEALTH: '/api/health'
  },
  
  // Environment
  ENV: 'production',  // or 'development'
  DEBUG: false        // Set to true for debugging
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${CONFIG.BACKEND_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

// Export for use in other files
window.CONFIG = CONFIG;
window.apiCall = apiCall;