import api from '../api';

export const getDadosCompletosRelatorio = (mes, ano) =>
  api.get(`/api/relatorios/${mes}/${ano}/dados-completos`);
