// client/utils/firebaseClient.js
// Inicializa o Firebase Web SDK (Expo Web e web em geral)
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// ⚠️ suas credenciais do app Web (Configurações do projeto > Apps > Web)
const firebaseConfig = {
  apiKey: "AIzaSyCW2sFJxXCwgyi-dWZeWpz_vm-Vhg-CxRc",
  authDomain: "assisconnect-mobile.firebaseapp.com",
  projectId: "assisconnect-mobile",
  storageBucket: "assisconnect-mobile.firebasestorage.app",
  messagingSenderId: "334706244926",
  appId: "1:334706244926:web:c8f0e71d3953f9cf62806f",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "pt-BR";
