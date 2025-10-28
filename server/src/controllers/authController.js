// server/src/controllers/authController.js
import { prepareLogin, sendLoginEmail, validateCode } from "../services/authService.js";

// Início do login: responde IMEDIATO se usuário existe; e-mail segue em background
export const startLogin = async (req, res) => {
  try {
    const { cpf } = req.body;
    if (!cpf) {
      return res.status(400).json({ success: false, error: "CPF é obrigatório" });
    }

    console.log("🔐 [AUTH] startLogin()", { cpf });

    // agora procura o RESPONSÁVEL em 'usuarios' (service já normaliza CPF)
    const prep = await prepareLogin(cpf);

    if (!prep.success) {
      console.log("❌ [AUTH] startLogin ->", prep.error);
      return res.status(404).json({
        success: false,
        error: prep.error || "Responsável não encontrado",
      });
    }

    // responde já — app vai para a tela do código
    res.json({
      success: true,
      message: "Código sendo enviado por e-mail.",
      email: prep.email,           // e-mail completo (mostra na UI)
      usuarioId: prep.usuarioId ?? null,
    });

    // envio assíncrono (não bloqueia a resposta)
    sendLoginEmail(prep.email, prep.code).catch((err) => {
      console.error("❌ [AUTH] Falha ao enviar e-mail (background):", err?.message || err);
    });
  } catch (err) {
    console.error("💥 [AUTH] startLogin erro não tratado:", err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: "Erro interno ao iniciar login." });
    }
  }
};

// Validação do código (no DOC do RESPONSÁVEL)
export const verifyCode = async (req, res) => {
  try {
    const { cpf, code } = req.body;
    if (!cpf || !code) {
      return res.status(400).json({ success: false, error: "CPF e código são obrigatórios" });
    }

    console.log("🔐 [AUTH] verifyCode()", { cpf });

    const result = await validateCode(cpf, code);
    if (!result.success) {
      return res.status(401).json({ success: false, error: result.error || "Código inválido" });
    }

    // agora retornamos também o idoso populado (se houver vínculo)
    return res.json({
      success: true,
      message: "Código validado!",
      usuario: result.usuario,
      idoso: result.idoso ?? null,
    });
  } catch (err) {
    console.error("💥 [AUTH] verifyCode erro não tratado:", err);
    return res.status(500).json({ success: false, error: "Erro interno ao validar código." });
  }
};
