import { db } from "../config/firebase.js";
import UsuarioModel from "../models/user.model.js";

const COLLECTION = "usuarios";

function onlyDigits(v = "") {
  return String(v).replace(/\D/g, "");
}

async function cpfJaExiste(cpf, ignorarDocId = null) {
  const snap = await db.collection(COLLECTION).where("cpf", "==", cpf).get();
  if (snap.empty) return false;
  if (!ignorarDocId) return true;
  return snap.docs.some((d) => d.id !== ignorarDocId);
}

async function emailJaExiste(email, ignorarDocId = null) {
  const snap = await db.collection(COLLECTION).where("email", "==", email).get();
  if (snap.empty) return false;
  if (!ignorarDocId) return true;
  return snap.docs.some((d) => d.id !== ignorarDocId);
}

async function validaIdosoRefSeInformado(idosoRef) {
  if (!idosoRef) return; // opcional
  const ref = db.doc(idosoRef);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error("Idoso não encontrado para o idosoRef informado");
  }
}

const usuarioService = {
  async getAll() {
    const snapshot = await db.collection(COLLECTION).get();
    const usuarios = [];

    for (const docSnap of snapshot.docs) {
      const usuario = docSnap.data();

      let idosoData = null;
      if (usuario.idosoRef) {
        const idosoRef = db.doc(usuario.idosoRef);
        const idosoSnap = await idosoRef.get();
        idosoData = idosoSnap.exists ? idosoSnap.data() : null;
      }

      usuarios.push({
        id: docSnap.id,
        ...usuario,
        idoso: idosoData,
      });
    }

    return usuarios;
  },

  async getById(id) {
    const docRef = db.collection(COLLECTION).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) throw new Error("Usuário não encontrado");

    const usuarioData = snapshot.data();

    let idosoData = null;
    if (usuarioData.idosoRef) {
      const idosoRef = db.doc(usuarioData.idosoRef);
      const idosoSnap = await idosoRef.get();
      idosoData = idosoSnap.exists ? idosoSnap.data() : null;
    }

    return { id: snapshot.id, ...usuarioData, idoso: idosoData };
  },

  async create(data) {
    // idosoRef é opcional (pode vincular depois)
    await validaIdosoRefSeInformado(data.idosoRef);

    if (await cpfJaExiste(data.cpf)) {
      throw new Error("CPF já cadastrado para outro usuário");
    }
    if (await emailJaExiste(data.email)) {
      throw new Error("E-mail já cadastrado para outro usuário");
    }

    const usuario = new UsuarioModel(data);
    const payload = {
      ...usuario.toJSON(),
      cpf_digits: onlyDigits(usuario.cpf), // campo auxiliar para login
    };

    const ref = await db.collection(COLLECTION).add(payload);
    return { id: ref.id, ...payload };
  },

  async update(id, data) {
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Usuário não encontrado");

    const atual = snap.data();
    const merged = { ...atual, ...data };

    // valida vínculos se informado
    await validaIdosoRefSeInformado(merged.idosoRef);

    // se CPF/email mudarem, garantir unicidade
    if (merged.cpf && merged.cpf !== atual.cpf) {
      if (await cpfJaExiste(merged.cpf, id)) {
        throw new Error("CPF já cadastrado para outro usuário");
      }
    }
    if (merged.email && merged.email !== atual.email) {
      if (await emailJaExiste(merged.email, id)) {
        throw new Error("E-mail já cadastrado para outro usuário");
      }
    }

    const usuarioValidado = new UsuarioModel(merged);
    const payload = {
      ...usuarioValidado.toJSON(),
      cpf_digits: onlyDigits(usuarioValidado.cpf),
    };

    await ref.update(payload);
    return { id, ...payload };
  },

  async remove(id) {
    const ref = db.collection(COLLECTION).doc(id);
    await ref.delete();
    return { success: true };
  },
};

export default usuarioService;
