import { db } from "../config/firebase.js";

const COLLECTION = "pessoaidosa";

export const elderService = {
  async getAll() {
    const snapshot = await db.collection(COLLECTION).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getById(id) {
    const docRef = db.collection(COLLECTION).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) throw new Error("Pessoa Idosa não encontrada");
    return { id: snapshot.id, ...snapshot.data() };
  },

  async create(data) {
    const { error, value } = elder.validate(data);
    if (error) throw new Error(error.details[0].message);

    const ref = await db.collection(COLLECTION).add(value);
    return { id: ref.id, ...value };
  },

  async update(id, data) {
    const { error, value } = elder.validate(data, { allowUnknown: true });
    if (error) throw new Error(error.details[0].message);

    const ref = db.collection(COLLECTION).doc(id);
    await ref.update(value);
    return { id, ...value };
  },

  async remove(id) {
    const ref = db.collection(COLLECTION).doc(id);
    await ref.delete();
    return { success: true };
  },
};
