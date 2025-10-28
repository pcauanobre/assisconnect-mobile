import { admin } from "../config/firebase.js";
import nodemailer from "nodemailer";

const db = admin.firestore();
const usuariosRef = db.collection("usuarios");

// -------- SMTP helpers (lazy) --------
let transporter = null;

function getSMTPConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || user;
  return { host, port, user, pass, from };
}

async function createTransporter() {
  const { host, port, user, pass } = getSMTPConfig();
  if (!host || !user || !pass) {
    console.error(
      "SMTP vars ->",
      "HOST:", !!host,
      "PORT:", port,
      "USER:", !!user,
      "PASS:", pass ? "***" : false
    );
    throw new Error("SMTP não configurado (.env ausente ou incompleto).");
  }

  const tx = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL; 587 = STARTTLS
    auth: { user, pass },
    logger: true,
    debug: true,
  });

  try {
    console.log("🔌 Verificando conexão SMTP…");
    await tx.verify();
    console.log("✅ SMTP pronto para enviar e-mails.");
  } catch (err) {
    console.error("❌ Falha ao verificar SMTP:", err?.message || err);
    throw err;
  }

  return tx;
}

async function ensureTransporter() {
  if (!transporter) transporter = await createTransporter();
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const { from, host, port, user } = getSMTPConfig();
  const tx = await ensureTransporter();

  console.log(`📨 [AUTH] Enviando e-mail para: ${to}`);
  const info = await tx.sendMail({ from, to, subject, text, html });
  console.log("📧 E-mail enviado:", info.messageId, "via", host, port, "as", user);
  return info;
}

// -------- Utils --------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function onlyDigits(v = "") {
  return String(v).replace(/\D/g, "");
}
function formatCpf(digits) {
  if (digits.length !== 11) return null;
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
}
function isValidEmail(email) {
  if (!email) return false;
  const e = String(email).trim().toLowerCase();
  if (!EMAIL_REGEX.test(e)) return false;
  const badDomains = new Set(["email.com", "example.com", "test.com", "teste.com"]);
  const domain = e.split("@")[1];
  if (badDomains.has(domain)) return false;
  return true;
}
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function findUsuarioByCpf(cpfInput) {
  const digits = onlyDigits(cpfInput || "");
  const formatted = formatCpf(digits);

  // 1ª tentativa: CPF formatado (modelo padrão)
  if (formatted) {
    const snap = await usuariosRef.where("cpf", "==", formatted).limit(1).get();
    if (!snap.empty) return snap.docs[0];
  }

  // 2ª tentativa: exatamente o valor enviado (caso tenha sido salvo cru)
  const snapRaw = await usuariosRef.where("cpf", "==", String(cpfInput)).limit(1).get();
  if (!snapRaw.empty) return snapRaw.docs[0];

  // 3ª tentativa: se você tiver salvo um campo auxiliar "cpf_digits"
  const snapDigits = await usuariosRef.where("cpf_digits", "==", digits).limit(1).get();
  if (!snapDigits.empty) return snapDigits.docs[0];

  return null;
}

async function populateIdoso(idosoRefPath) {
  try {
    if (!idosoRefPath) return null;
    const ref = db.doc(idosoRefPath);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  } catch (_) {
    return null;
  }
}

// -------- Services --------

// 1) Prepara login (RESPONSÁVEL)
export const prepareLogin = async (cpfResponsavel) => {
  console.log("🔎 Procurando responsável com CPF:", cpfResponsavel);

  const usuarioDoc = await findUsuarioByCpf(cpfResponsavel);
  if (!usuarioDoc) {
    console.log("❌ Responsável não encontrado");
    return { success: false, error: "Responsável não encontrado" };
  }

  const usuario = usuarioDoc.data();
  const email = (usuario?.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    console.log("❌ E-mail inválido no cadastro:", email || "(vazio)");
    return { success: false, error: "E-mail do responsável inválido no cadastro" };
  }

  const code = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

  await usuarioDoc.ref.update({
    loginCode: code,
    loginCodeExpiresAt: expiresAt,
    lastLoginCodeAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("✅ Responsável encontrado. Código gerado e salvo. E-mail destino:", email);
  return { success: true, email, code, usuarioId: usuarioDoc.id };
};

// 2) Envia o e-mail
export const sendLoginEmail = async (email, code) => {
  const subject = "Seu código de acesso - AssisConnect";
  const text = `Olá,

Recebemos um pedido de acesso ao AssisConnect.

Seu código de verificação é: ${code}
Validade: 10 minutos.

Se você não solicitou este código, ignore este e-mail.`;

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f7f7f7; padding:24px;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.06);">
      <div style="padding:20px 24px; background:#F5E8D9; border-bottom:1px solid #ecd7bf;">
        <h1 style="margin:0; font-size:18px; color:#4E342E;">AssisConnect</h1>
        <p style="margin:6px 0 0 0; font-size:12px; color:#6B5E55;">Verificação de acesso</p>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 12px 0; color:#2f2f2f;">Olá,</p>
        <p style="margin:0 0 16px 0; color:#2f2f2f;">Use o código abaixo para entrar no aplicativo:</p>
        <div style="text-align:center; margin:18px 0;">
          <div style="display:inline-block; padding:14px 24px; border:1px dashed #c7b6a6; border-radius:10px; font-size:24px; letter-spacing:4px; color:#4E342E; font-weight:bold;">
            ${code}
          </div>
        </div>
        <p style="margin:16px 0 0 0; color:#6B5E55; font-size:13px;">O código é válido por <strong>10 minutos</strong>. Se você não solicitou este código, ignore esta mensagem.</p>
      </div>
      <div style="padding:16px 24px; background:#faf6f1; border-top:1px solid #ecd7bf; color:#6B5E55; font-size:12px;">
        AssisConnect • Suporte
      </div>
    </div>
  </div>`;

  return sendMail({ to: email, subject, text, html });
};

// 3) Valida o código (no DOC DO RESPONSÁVEL)
export const validateCode = async (cpfResponsavel, code) => {
  const usuarioDoc = await findUsuarioByCpf(cpfResponsavel);
  if (!usuarioDoc) return { success: false, error: "Responsável não encontrado" };

  const data = usuarioDoc.data();
  const stored = data.loginCode;
  const expiresAt = data.loginCodeExpiresAt || 0;

  if (!stored || !expiresAt) return { success: false, error: "Nenhum código foi gerado" };
  if (Date.now() > expiresAt) return { success: false, error: "Código expirado" };
  if (String(code) !== String(stored)) return { success: false, error: "Código inválido" };

  await usuarioDoc.ref.update({
    loginCode: admin.firestore.FieldValue.delete(),
    loginCodeExpiresAt: admin.firestore.FieldValue.delete(),
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const usuario = { id: usuarioDoc.id, ...data };
  const idoso = await populateIdoso(usuario.idosoRef);

  return { success: true, usuario, idoso };
};
