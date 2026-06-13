// ============================================
// admin-login.js - FIREBASE VERSION
// ============================================

import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

async function login() {
  const email = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error");

  if (!email || !password) {
    errorEl.textContent = "Please enter email and password";
    errorEl.classList.add("show");
    return;
  }

  try {
    console.log("🔐 Attempting Firebase login...");
    
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("✅ Firebase auth successful:", user.uid);

    // Get user details from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found in database");
    }

    const userData = userDoc.data();

    // Validate user has admin role
    if (userData.role !== 'admin' && userData.role !== 'staff') {
      throw new Error("User does not have admin privileges");
    }

    console.log("✅ Admin login successful:", userData.name);

    // Save to localStorage
    localStorage.setItem("adminLoggedIn", "true");
    localStorage.setItem("userId", user.uid);
    localStorage.setItem("loggedInStore", userData.store);
    localStorage.setItem("userName", userData.name);
    localStorage.setItem("userEmail", user.email);

    // Optional: Save user data for later use
    localStorage.setItem("adminData", JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: userData.name,
      store: userData.store,
      role: userData.role
    }));

    // Redirect to admin panel
    window.location.href = "/public/restaurant.html";

  } catch (error) {
    console.error("❌ Login error:", error);
    
    let errorMessage = "Login failed";
    if (error.code === 'auth/user-not-found') {
      errorMessage = "User not found";
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = "Wrong password";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email format";
    } else {
      errorMessage = error.message;
    }

    errorEl.textContent = errorMessage;
    errorEl.classList.add("show");
    document.getElementById("password").value = "";
  }
}

// Allow Enter key to submit
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && window.location.pathname.includes("admin-login")) {
    login();
  }
});

// Make login globally available
window.login = login;


// ============================================
// restaurant.js - FIREBASE VERSION (EXCERPT)
// ============================================

import { collection, query, where, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import { db } from './firebase-config.js';

// ✅ AUTH GUARD
if (localStorage.getItem('adminLoggedIn') !== 'true') {
  window.location.href = 'admin-login.html';
}

const loggedInStore = localStorage.getItem('loggedInStore') || 'all';
const adminData = JSON.parse(localStorage.getItem('adminData')) || {};

const storeNames = {
  xiaoyun: 'Small Cloud',
  goldenbowl: 'The Golden Bowl',
  zapfan: 'Zap Fan',
  bobamilk: 'Boba Milk',
  vitaminc: 'Vitamin C',
  all: 'All Stalls'
};

const currentStoreName = storeNames[loggedInStore] || 'All Stalls';

// Dynamic UI updates
document.title = `${currentStoreName} Control Panel`;
const pageTitle = document.querySelector('.page-title');
if (pageTitle) pageTitle.textContent = `${currentStoreName} Live Orders`;

let orders = [];
let unsubscribe = null;

// ─────────────────────────────────────────────────────────
// SETUP REAL-TIME LISTENER FOR ORDERS
// ─────────────────────────────────────────────────────────
function setupOrderListener() {
  try {
    let q;

    if (loggedInStore === 'all') {
      // Admin can see all orders
      q = query(collection(db, "orders"));
    } else {
      // Staff can only see their restaurant's orders
      q = query(
        collection(db, "orders"),
        where("restaurant", "==", currentStoreName)
      );
    }

    unsubscribe = onSnapshot(q, (snapshot) => {
      orders = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      // Save to localStorage
      localStorage.setItem('foodcourt_orders', JSON.stringify(orders));

      // Re-render
      renderOrders();

    }, (error) => {
      console.error("Firestore listener error:", error);
      alert("Error loading orders: " + error.message);
    });

  } catch (error) {
    console.error("Error setting up listener:", error);
  }
}

// ─────────────────────────────────────────────────────────
// NORMALIZE ORDER (Handle different data formats)
// ─────────────────────────────────────────────────────────
function normalizeOrder(order) {
  const statusMap = { ordered: 'new', pending: 'new', confirmed: 'preparing' };
  let status = statusMap[order.status] || order.status || 'new';
  
  let itemsText = order.items;
  if (Array.isArray(order.items)) {
    itemsText = order.items.map(i => `${i.quantity || 1}x ${i.name}`).join(', ');
  }

  return {
    id: order.id || 'ORD-' + Date.now().toString().slice(-6),
    table: order.table || 'Kiosk',
    items: itemsText,
    time: order.orderDate || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    status: status,
    customer: order.customer || {},
    restaurant: order.restaurant || order.stall || ''
  };
}

// ─────────────────────────────────────────────────────────
// RENDER ORDERS IN KANBAN COLUMNS
// ─────────────────────────────────────────────────────────
function renderOrders() {
  const normalized = orders.map(normalizeOrder);

  ['new', 'preparing', 'ready'].forEach(status => {
    const container = document.getElementById(`col-${status}`);
    if (!container) return;
    container.innerHTML = '';
    
    // Filter by status AND store
    const filtered = normalized.filter(o => {
      const matchesStatus = o.status === status;
      const notCompleted = o.status !== 'completed';
      const matchesStore = loggedInStore === 'all' || 
                           o.restaurant === currentStoreName;
      return matchesStatus && notCompleted && matchesStore;
    });
    
    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-col"><i class="fas fa-clipboard-list"></i>No orders</div>`;
    } else {
      filtered.forEach(order => {
        container.innerHTML += createOrderCard(order);
      });
    }

    updateCounts();
  });
}

// ─────────────────────────────────────────────────────────
// CREATE ORDER CARD
// ─────────────────────────────────────────────────────────
function createOrderCard(order) {
  let actions = '';
  
  if (order.status === 'new') {
    actions = `<button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'preparing')">Start Preparing</button>`;
  } else if (order.status === 'preparing') {
    actions = `<button class="btn btn-secondary" onclick="updateOrderStatus('${order.id}', 'ready')">Mark Ready</button>`;
  } else if (order.status === 'ready') {
    actions = `<button class="btn btn-done" onclick="updateOrderStatus('${order.id}', 'completed')">Complete</button>`;
  }

  return `
    <div class="order-card">
      <div class="order-card-top">
        <span class="order-id">${order.id}</span>
        <span class="order-table">${order.table}</span>
      </div>
      <div class="order-items"><strong>${order.items}</strong></div>
      <div class="order-time">Placed: ${order.time}</div>
      ${order.customer?.phone ? `<div class="order-phone">📞 ${order.customer.phone}</div>` : ''}
      <div class="card-actions">${actions}</div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────
// UPDATE ORDER STATUS IN FIREBASE
// ─────────────────────────────────────────────────────────
async function updateOrderStatus(orderId, newStatus) {
  try {
    console.log(`📝 Updating order ${orderId} to ${newStatus}...`);
    
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: new Date()
    });

    console.log(`✅ Order ${orderId} updated`);
    
    // Firebase listener will automatically re-render
    showToast(`Order ${orderId} → ${newStatus.toUpperCase()}`);

  } catch (error) {
    console.error("❌ Error updating order:", error);
    alert("Error updating order: " + error.message);
  }
}

// ─────────────────────────────────────────────────────────
// UPDATE COUNT BADGES
// ─────────────────────────────────────────────────────────
function updateCounts() {
  const normalized = orders.map(normalizeOrder);
  const storeFiltered = normalized.filter(o => 
    loggedInStore === 'all' || o.restaurant === currentStoreName
  );

  const counts = {
    new: storeFiltered.filter(o => o.status === 'new').length,
    preparing: storeFiltered.filter(o => o.status === 'preparing').length,
    ready: storeFiltered.filter(o => o.status === 'ready').length
  };

  Object.keys(counts).forEach(s => {
    const c = document.getElementById(`count-${s}`);
    const b = document.getElementById(`badge-${s}`);
    if (c) c.textContent = counts[s];
    if (b) b.textContent = counts[s];
  });
}

// ─────────────────────────────────────────────────────────
// SHOW TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────
function showToast(message) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = message;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
}

// ─────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────
window.logout = async () => {
  if (confirm("Logout?")) {
    try {
      await signOut(auth);
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('userId');
      localStorage.removeItem('loggedInStore');
      localStorage.removeItem('adminData');
      window.location.href = 'admin-login.html';
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
};

// ─────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log(`🚀 Initializing admin panel for: ${currentStoreName}`);
  console.log(`👤 Logged in as: ${adminData.name}`);
  
  setupOrderListener();
});

// ─────────────────────────────────────────────────────────
// CLEANUP ON UNLOAD
// ─────────────────────────────────────────────────────────
window.addEventListener('beforeunload', () => {
  if (unsubscribe) {
    console.log("🧹 Cleaning up Firebase listener");
    unsubscribe();
  }
});

// Make functions globally available
window.updateOrderStatus = updateOrderStatus;
window.showToast = showToast;