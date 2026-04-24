import axios from 'axios';
import { Platform } from 'react-native';

// ===================================================================
// CONFIGURACAO DA URL DO BACKEND
// ===================================================================
// Platform.OS detecta automaticamente onde o app esta rodando:
//
// - 'web'     → Quando abre no NAVEGADOR (npm run frontend:web)
//               Usa localhost porque o navegador e o backend estao
//               na mesma maquina.
//
// - 'android' → Quando abre no CELULAR via Expo Go (QR code)
//               O celular NAO entende "localhost" (localhost = o proprio
//               celular). Entao precisa usar o IP real do PC na rede.
//
// - 'ios'     → Mesma logica do Android, usa o IP da rede.
//
// IMPORTANTE: Se trocar de rede Wi-Fi, o IP pode mudar.
//             Para descobrir o novo IP, rode "ipconfig" no terminal
//             e procure o "Endereco IPv4" do seu Wi-Fi.
// ===================================================================
const API_BASE = Platform.OS === 'web'
  ? 'http://localhost:8080'       // navegador → backend local
  : 'http://192.168.15.10:8080'; // celular   → IP do PC na rede

// Cria uma instancia do Axios ja configurada com a URL base
// Todas as chamadas de API (login, idosos, cardapio, etc.)
// usam essa instancia, sem precisar repetir a URL
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // 15 segundos de timeout
  headers: { 'Content-Type': 'application/json' },
});

export { API_BASE };
export default api;
