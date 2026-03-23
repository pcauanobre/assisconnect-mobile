import api from '../api';

export const getCardapio = () => api.get('/cardapio');
export const getCardapioHoje = () => api.get('/cardapio/hoje');
export const updateCardapio = (items) => api.put('/cardapio/atualizar', items);
