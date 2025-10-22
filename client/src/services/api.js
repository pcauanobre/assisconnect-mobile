// Chamadas ao backend HTTP (que envia e-mails via SMTP)
const API_URL = "http://localhost:3000"; // em device físico, troque por http://SEU_IP_LOCAL:3000

export async function startLogin(cpf) {
  const resp = await fetch(`${API_URL}/api/auth/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf }),
  });
  return resp.json();
}

export async function verifyCode(cpf, code) {
  const resp = await fetch(`${API_URL}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf, code }),
  });
  return resp.json();
}
