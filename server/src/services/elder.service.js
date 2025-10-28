import { db } from "../config/firebase.js";
import PessoaIdosaModel from "../models/elder.model.js";

const COLLECTION = "pessoaIdosa";

async function cpfJaExiste(cpf, ignorarDocId = null) {
  const snap = await db.collection(COLLECTION).where("cpf", "==", cpf).get();
  if (snap.empty) return false;
  if (!ignorarDocId) return true;
  return snap.docs.some((d) => d.id !== ignorarDocId);
}

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
    if (await cpfJaExiste(data.cpf)) {
      throw new Error("CPF já cadastrado para outra pessoa idosa");
    }

    const pessoa = new PessoaIdosaModel(data);
    const ref = await db.collection(COLLECTION).add(pessoa.toJSON());
    return { id: ref.id, ...pessoa.toJSON() };
  },

  async update(id, data) {
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Pessoa Idosa não encontrada");

    const atual = snap.data();
    const merged = { ...atual, ...data };

    // se CPF foi alterado, garantir unicidade
    if (merged.cpf && merged.cpf !== atual.cpf) {
      if (await cpfJaExiste(merged.cpf, id)) {
        throw new Error("CPF já cadastrado para outra pessoa idosa");
      }
    }

    // ✅ valida o schema parcial (aceita apenas campos enviados)
    const pessoaParcial = new PessoaIdosaModel(merged, { allowPartial: true });

    await ref.update(pessoaParcial.toJSON());
    return { id, ...pessoaParcial.toJSON() };
  },

  async remove(id) {
    const ref = db.collection(COLLECTION).doc(id);
    await ref.delete();
    return { success: true };
  },
};

export default elderService;
