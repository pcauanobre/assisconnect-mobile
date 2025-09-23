// server/src/controllers/authController.js
import { sendCode, validateCode } from "../services/authService.js";

// Início do login (consulta CPF no Firestore e devolve telefone)
export const startLogin = async (req, res) => {
  const { cpf } = req.body;
  if (!cpf) {
    return res.status(400).json({ success: false, error: "CPF é obrigatório" });
  }

  try {
    const result = await sendCode(cpf);

    if (!result.success) {
      return res.status(404).json(result);
    }

    // devolvemos o telefone para o front disparar o signInWithPhoneNumber
    return res.json({
      success: true,
      message: result.message || "📲 Código enviado!",
      telefone: result.telefone,
    });
  } catch (err) {
    console.error("Erro no startLogin:", err);
    return res
      .status(500)
      .json({ success: false, error: "Erro interno ao enviar código." });
  }
};

// Validação do código mockado
export const verifyCode = async (req, res) => {
  const { cpf, code } = req.body;
  if (!cpf || !code) {
    return res
      .status(400)
      .json({ success: false, error: "CPF e código são obrigatórios" });
  }

  try {
    const result = await validateCode(cpf, code);
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error || "Código inválido",
      });
    }

    return res.json({
      success: true,
      usuario: result.usuario,
      message: "✅ Código validado (mock)!",
    });
  } catch (err) {
    console.error("Erro no verifyCode:", err);
    return res
      .status(500)
      .json({ success: false, error: "Erro interno ao validar código." });
  }
};
