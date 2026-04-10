import api from '../api';

export const getRelatorios = () => api.get('/api/relatorios');
export const getRelatoriosPorAno = (ano) => api.get(`/api/relatorios/ano/${ano}`);
export const getRelatorio = (mes, ano) => api.get(`/api/relatorios/${mes}/${ano}`);
export const saveRelatorio = (data) => api.post('/api/relatorios', data);
export const gerarPendentes = (mesAtual, anoAtual) =>
  api.post(`/api/relatorios/gerar-pendentes/${mesAtual}/${anoAtual}`);
export const getEstatisticas = (mes, ano) =>
  api.get(`/api/relatorios/estatisticas/${mes}/${ano}`);
export const limparRelatorioPorAno = (ano) =>
  api.delete(`/api/relatorios/ano/${ano}`);
