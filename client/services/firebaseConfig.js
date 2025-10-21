// client/services/firebaseConfig.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ⚙️ Config do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyCW2sFJxXCwgyi-dWZeWpz_vm-Vhg-CxRc",
  authDomain: "assisconnect-mobile.firebaseapp.com",
  projectId: "assisconnect-mobile",
  storageBucket: "assisconnect-mobile.firebasestorage.app",
  messagingSenderId: "334706244926",
  appId: "1:334706244926:web:c8f0e71d3953f9cf62806f",
  measurementId: "G-D1E01MQDLD",
};

// 🚀 Garante **uma** instância
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// 🔗 Instâncias compartilhadas
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
