import api from '../api';

export const getBackup = () => api.get('/admin/backup');

export const getBackupResumo = () => api.get('/admin/backup/resumo');
