// server/src/controllers/authController.js
import { prepareLogin, sendLoginEmail, validateCode } from "../services/authService.js";

// Início do login: responde IMEDIATO se pessoa existe, e envia e-mail em background
export const startLogin = async (req, res) => {
  const { cpf } = req.body;
  if (!cpf) return res.status(400).json({ success: false, error: "CPF é obrigatório" });

  try {
    const prep = await prepareLogin(cpf); // gera/salva código e pega e-mail

    if (!prep.success) {
      return res.status(404).json({ success: false, error: prep.error || "Pessoa idosa não encontrada" });
    }

    // responde já (navegação vai para a tela de código imediatamente)
    res.json({
      success: true,
      message: "Código sendo enviado por e-mail.",
      email: prep.email, // e-mail completo
    });

    // dispara envio em background (não bloqueia a resposta)
    sendLoginEmail(prep.email, prep.code).catch((err) => {
      console.error("❌ Erro pós-resposta ao enviar e-mail:", err);
    });
  } catch (err) {
    console.error("Erro no startLogin:", err);
    // se der erro antes de responder
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: "Erro interno ao iniciar login." });
    }
  }
};

// Validação do código
export const verifyCode = async (req, res) => {
  const { cpf, code } = req.body;
  if (!cpf || !code) return res.status(400).json({ success: false, error: "CPF e código são obrigatórios" });

  try {
    const result = await validateCode(cpf, code);
    if (!result.success) return res.status(401).json({ success: false, error: result.error || "Código inválido" });

    return res.json({ success: true, usuario: result.usuario, message: "Código validado!" });
  } catch (err) {
    console.error("Erro no verifyCode:", err);
    return res.status(500).json({ success: false, error: "Erro interno ao validar código." });
  }
};
