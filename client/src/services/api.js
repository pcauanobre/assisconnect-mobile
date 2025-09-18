// client/src/services/api.js
const BASE_URL = "http://localhost:3000";

export async function startLogin(cpf) {
  const r = await fetch(`${BASE_URL}/api/auth/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf }),
  });
  return r.json();
}

export async function verifyCode(cpf, code) {
  const r = await fetch(`${BASE_URL}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf, code }),
  });
  return r.json();
}
