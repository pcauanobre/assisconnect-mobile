import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import admin from "firebase-admin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, "firebase-key.json"); // caminho direto, sem ../../

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
export { db, admin };

// mudei o diretorio da key