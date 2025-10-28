import { db } from "../config/firebase.js";
import UsuarioModel from "../models/user.model.js";

const COLLECTION = "usuarios";

const usuarioService = {
  async getAll() {
    const snapshot = await db.collection(COLLECTION).get();
    const usuarios = [];

    for (const docSnap of snapshot.docs) {
      const usuario = docSnap.data();

      // popula o idoso relacionado usando idosoRef
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

    // popula o idoso relacionado
    let idosoData = null;
    if (usuarioData.idosoRef) {
      const idosoRef = db.doc(usuarioData.idosoRef);
      const idosoSnap = await idosoRef.get();
      idosoData = idosoSnap.exists ? idosoSnap.data() : null;
    }

    return { id: snapshot.id, ...usuarioData, idoso: idosoData };
  },

  async create(data) {
    if (!data.idosoRef) throw new Error("idosoRef é obrigatório");
    const idosoRef = db.doc(data.idosoRef);

    const idosoSnap = await idosoRef.get();
    if (!idosoSnap.exists) throw new Error("Idoso não encontrado para o idosoRef informado");

    // cria e valida o modelo
    const usuario = new UsuarioModel(data);

    // grava no Firestore
    const ref = await db.collection(COLLECTION).add(usuario.toJSON());
    return { id: ref.id, ...usuario.toJSON() };
  },

  async update(id, data) {
    // se atualizar idosoRef, valida novamente
    if (data.idosoRef) {
      const idosoRef = db.doc(data.idosoRef);
      const idosoSnap = await idosoRef.get();
      if (!idosoSnap.exists) throw new Error("Idoso não encontrado para o idosoRef informado");
    }

    // cria e valida o modelo
    const usuario = new UsuarioModel(data);
    await db.collection(COLLECTION).doc(id).update(usuario.toJSON());
    return { id, ...usuario.toJSON() };
  },

  async remove(id) {
    const ref = db.collection(COLLECTION).doc(id);
    await ref.delete();
    return { success: true };
  },
};

export default usuarioService;
