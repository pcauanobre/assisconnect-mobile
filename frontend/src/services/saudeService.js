import api from '../api';

export const getRegistrosSaude = (idosoId) =>
  api.get(`/saude/idoso/${idosoId}`);

export const getUltimoRegistroSaude = (idosoId) =>
  api.get(`/saude/idoso/${idosoId}/ultimo`);

export const createRegistroSaude = (data) => api.post('/saude', data);

export const updateRegistroSaude = (id, data) => api.put(`/saude/${id}`, data);

export const deleteRegistroSaude = (id) => api.delete(`/saude/${id}`);
