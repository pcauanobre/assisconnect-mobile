import elderService from "../services/elder.service.js";
import usuarioService from "../services/user.service.js";

/**
 * Cria Usuário responsável e Pessoa Idosa já vinculados entre si.
 * - elder.responsavelRef -> usuarios/{user.id}
 * - user.idosoRef -> pessoaIdosa/{elder.id}
 */
export const createElderAndUser = async (req, res) => {
  const { elder, user } = req.body || {};
  if (!elder || !user) {
    return res
      .status(400)
      .json({ error: "Corpo inválido: envie { elder, user }" });
  }

  try {
    // 1️⃣ Cria o usuário (responsável) primeiro
    const createdUser = await usuarioService.create(user);

    // 2️⃣ Cria o idoso vinculado ao usuário
    const elderPayload = {
      ...elder,
      responsavelRef: `usuarios/${createdUser.id}`,
    };

    let createdElder = null;
    try {
      createdElder = await elderService.create(elderPayload);
    } catch (elderErr) {
      // rollback se falhar ao criar idoso
      await usuarioService.remove(createdUser.id);
      return res.status(400).json({ error: elderErr.message });
    }

    // 3️⃣ Atualiza o usuário para apontar pro idoso
    await usuarioService.update(createdUser.id, {
      idosoRef: `pessoaIdosa/${createdElder.id}`,
    });

    return res.status(201).json({
      message: "Usuário e pessoa idosa criados com sucesso!",
      user: { ...createdUser, idosoRef: `pessoaIdosa/${createdElder.id}` },
      elder: { ...createdElder, responsavelRef: `usuarios/${createdUser.id}` },
    });
  } catch (err) {
    console.error("❌ Erro ao criar usuário e idoso:", err);
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Vincula manualmente um usuário já existente a um idoso já existente
 * PATCH /admin/link-user/:userId/elder/:elderId
 */
export const linkUserToElder = async (req, res) => {
  const { userId, elderId } = req.params;
  if (!userId || !elderId) {
    return res
      .status(400)
      .json({ error: "userId e elderId são obrigatórios" });
  }

  try {
    const updatedUser = await usuarioService.update(userId, {
      idosoRef: `pessoaIdosa/${elderId}`,
    });

    await elderService.update(elderId, {
      responsavelRef: `usuarios/${userId}`,
    });

    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
