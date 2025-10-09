// server/src/services/authService.js
import { admin } from "../config/firebase.js";
import nodemailer from "nodemailer";

const db = admin.firestore();
const pessoasRef = db.collection("pessoaIdosa");

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

function ensureTransporter() {
  if (transporter) return transporter;

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

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 587 STARTTLS, 465 SSL
    auth: { user, pass },
  });

  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const { from, host, port, user } = getSMTPConfig();
  const tx = ensureTransporter();
  const info = await tx.sendMail({ from, to, subject, text, html });
  console.log("📧 E-mail enviado:", info.messageId, "via", host, port, "as", user);
  return info;
}

// -------- Utils --------
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// -------- Templates de e-mail --------
function buildEmail(code) {
  const subject = "Seu código de acesso - AssisConnect";
  const text =
`Olá,

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
  return { subject, text, html };
}

// -------- Services --------

// 1) Prepara login: verifica pessoa, gera e salva código, devolve e-mail + código (para envio posterior)
export const prepareLogin = async (cpf) => {
  console.log("🔎 Procurando pessoa com CPF:", cpf);

  const docRef = pessoasRef.doc(cpf);
  const doc = await docRef.get();
  if (!doc.exists) {
    console.log("❌ Pessoa não encontrada no Firestore");
    return { success: false, error: "Pessoa idosa não encontrada" };
  }

  const pessoa = doc.data();
  const email = pessoa.emailVinculado || pessoa.emailResponsavel || pessoa.email || null;

  if (!email) {
    console.log("❌ Nenhum e-mail cadastrado para:", cpf);
    return { success: false, error: "E-mail não cadastrado" };
  }

  const code = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

  await docRef.update({
    loginCode: code,
    loginCodeExpiresAt: expiresAt,
  });

  console.log("✅ Pessoa encontrada. Código gerado e salvo. E-mail:", email);
  return { success: true, email, code };
};

// 2) Envia o e-mail (pode ser chamado em background, após responder ao client)
export const sendLoginEmail = async (email, code) => {
  console.log("📨 Agendando envio de e-mail para:", email);
  const { subject, text, html } = buildEmail(code);
  return sendMail({ to: email, subject, text, html });
};

// 3) Valida o código
export const validateCode = async (cpf, code) => {
  const docRef = pessoasRef.doc(cpf);
  const doc = await docRef.get();
  if (!doc.exists) return { success: false, error: "Pessoa não cadastrada" };

  const data = doc.data();
  const stored = data.loginCode;
  const expiresAt = data.loginCodeExpiresAt || 0;

  if (!stored || !expiresAt) return { success: false, error: "Nenhum código foi gerado" };
  if (Date.now() > expiresAt) return { success: false, error: "Código expirado" };
  if (String(code) !== String(stored)) return { success: false, error: "Código inválido" };

  await docRef.update({
    loginCode: admin.firestore.FieldValue.delete(),
    loginCodeExpiresAt: admin.firestore.FieldValue.delete(),
  });

  return { success: true, usuario: { id: doc.id, ...data } };
};
