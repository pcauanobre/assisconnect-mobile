// server/src/controllers/authController.js
import { prepareLogin, sendLoginEmail, validateCode } from "../services/authService.js";

// Início do login: responde IMEDIATO se pessoa existe; e-mail segue em background
export const startLogin = async (req, res) => {
  try {
    const { cpf } = req.body;
    if (!cpf) return res.status(400).json({ success: false, error: "CPF é obrigatório" });

    console.log("🔐 [AUTH] startLogin()", { cpf });

    const prep = await prepareLogin(cpf); // gera/salva código e localiza e-mail

    if (!prep.success) {
      console.log("❌ [AUTH] startLogin ->", prep.error);
      return res.status(404).json({
        success: false,
        error: prep.error || "Pessoa idosa não encontrada",
      });
    }

    // Responde já — app vai para tela do código
    res.json({
      success: true,
      message: "Código sendo enviado por e-mail.",
      email: prep.email, // e-mail completo, útil para mostrar na UI
    });

    // Envio assíncrono (não bloqueia a resposta)
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

// Validação do código
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

    return res.json({ success: true, usuario: result.usuario, message: "Código validado!" });
  } catch (err) {
    console.error("💥 [AUTH] verifyCode erro não tratado:", err);
    return res.status(500).json({ success: false, error: "Erro interno ao validar código." });
  }
};
