import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import admin from "firebase-admin";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ✅ A chave está na MESMA PASTA deste arquivo
const keyPath = join(__dirname, "firebase-key.json");

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
export { db, admin };
