import api from '../api';

export const getAtividades = (params) => api.get('/atividades', { params });
export const getAtividade = (id) => api.get(`/atividades/${id}`);
export const getAtividadesHoje = () => api.get('/atividades/hoje');
export const getDiasComRegistro = (inicio, fim) =>
  api.get('/atividades/dias-registrados', { params: { inicio, fim } });
export const saveAtividade = (data) => api.post('/atividades', data);
export const deleteAtividade = (id) => api.delete(`/atividades/${id}`);
