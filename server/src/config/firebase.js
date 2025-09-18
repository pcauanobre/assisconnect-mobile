// server/src/config/firebase.js
import admin from "firebase-admin";
import { readFileSync } from "fs";

// ⚠️ NÃO COMITAR ESTE ARQUIVO firebase-key.json!
// Ele deve existir localmente em: server/firebase-key.json
const serviceAccount = JSON.parse(
  readFileSync("./firebase-key.json", "utf-8")
);

if (!admin.apps?.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL é opcional para Firestore; pode manter sem.
    // databaseURL: "https://assisconnect-mobile.firebaseio.com",
  });
}

export default admin;
