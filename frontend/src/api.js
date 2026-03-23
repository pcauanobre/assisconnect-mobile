import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'web'
  ? 'http://localhost:8080'
  : 'http://10.0.0.91:8080';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export { API_BASE };
export default api;
