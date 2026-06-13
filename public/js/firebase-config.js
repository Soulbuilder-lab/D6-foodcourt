// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAFXnc1L4wHCeK6miW5hGxhSEtlyT1ERk",
  authDomain: "food-court-hub.firebaseapp.com",
  projectId: "food-court-hub",
  storageBucket: "food-court-hub.firebasestorage.app",
  messagingSenderId: "1085882711375",
  appId: "1:1085882711375:web:a2c3395afdf31ef529593a",
  measurementId: "G-LQEH075TG6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
enableIndexedDbPersistence(db);