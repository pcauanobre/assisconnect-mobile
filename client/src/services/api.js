// client/src/services/api.js
// 🔒 Fixe o IP LAN do seu PC (Wi-Fi 10.0.0.x) para o celular alcançar.
// Seu ipconfig mostrou: 10.0.0.222
const BASE_URL = "http://localhost:3000";

const TIMEOUT_MS = 10000; // evita loading infinito

function fetchWithTimeout(resource, options = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    return fetch(resource, {...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
}

async function post(path, body) {
    const url = `${BASE_URL.replace(/\/+$/,'')}${path}`;
    try {
        const r = await fetchWithTimeout(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return await r.json();
    } catch (e) {
        return { success: false, error: "Falha de rede (sem acesso ao servidor)." };
    }
}

export async function startLogin(cpf) {
    return post("/api/auth/start", { cpf });
}
export async function verifyCode(cpf, code) {
    return post("/api/auth/verify", { cpf, code });
}