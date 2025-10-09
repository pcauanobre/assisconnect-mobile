import { db } from "../config/firebase.js";
import PessoaIdosaModel from "../models/elder.model.js";

const COLLECTION = "pessoaidosa";

const elderService = {
  async getAll() {
    const snapshot = await db.collection(COLLECTION).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async getById(id) {
    const docRef = db.collection(COLLECTION).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) throw new Error("Pessoa Idosa não encontrada");
    return { id: snapshot.id, ...snapshot.data() };
  },

  async create(data) {
    const pessoa = new PessoaIdosaModel(data);
    const ref = await db.collection(COLLECTION).add(pessoa.toJSON());
    return { id: ref.id, ...pessoa.toJSON() };
  },

  async update(id, data) {
    // Atualização total (valida novamente)
    const pessoa = new PessoaIdosaModel(data);
    await db.collection(COLLECTION).doc(id).update(pessoa.toJSON());
    return { id, ...pessoa.toJSON() };
  },

  async remove(id) {
    const ref = db.collection(COLLECTION).doc(id);
    await ref.delete();
    return { success: true };
  },
};

export default elderService;
// s
