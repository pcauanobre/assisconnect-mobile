// server/src/services/authService.js
import admin from "../config/firebase.js";

const db = admin.firestore();
const pessoasRef = db.collection("pessoaIdosa");

/**
 * Envia o "código" (mock) e valida CPF no Firestore.
 * Retorna o telefone vinculado para o client disparar o SMS via Firebase Web.
 */
export const sendCode = async (cpf) => {
  console.log(`📌 Procurando pessoa com CPF: ${cpf}`);

  const doc = await pessoasRef.doc(cpf).get();
  if (!doc.exists) {
    console.log("❌ Pessoa não encontrada no Firestore");
    return { success: false, error: "Pessoa não cadastrada" };
  }

  const pessoa = doc.data();
  console.log("✅ Pessoa encontrada:", pessoa);

  // Aqui apenas logamos (mock). O SMS REAL é enviado no front (Firebase Web).
  console.log(`📲 Enviando SMS para ${pessoa.telefoneVinculado}`);

  return {
    success: true,
    message: "Código enviado (mock) — SMS real será enviado pelo app",
    telefone: pessoa.telefoneVinculado,
    usuarioPreview: { cpf, ...pessoa }, // opcional, útil para debug
  };
};

/**
 * Validação mock. Aceita apenas "123456".
 * (Se usar SMS real, a validação é feita no client, com confirmation.confirm(código))
 */
export const validateCode = async (cpf, code) => {
  console.log(`🔑 Validando código ${code} para CPF: ${cpf}`);

  const doc = await pessoasRef.doc(cpf).get();
  if (!doc.exists) {
    return { success: false, error: "Pessoa não cadastrada" };
  }

  if (code === "123456") {
    return {
      success: true,
      usuario: { id: doc.id, ...doc.data() },
    };
  }

  return { success: false, error: "Código inválido" };
};
