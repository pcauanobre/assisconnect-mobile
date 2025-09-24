// server/src/config/firebase.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPathEnv = process.env.FIREBASE_KEY_PATH; // opcional
const defaultPath = join(__dirname, "../../firebase-key.json");
const keyPath = keyPathEnv ? join(__dirname, "../../", keyPathEnv) : defaultPath;

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default admin;
