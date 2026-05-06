import { Platform, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';
const isWeb = Platform.OS === 'web';

// Suprime o aviso de push remoto no Expo Go SDK 53 —
// notificações locais funcionam normalmente, só o push remoto foi removido
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'expo-notifications: iOS Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

// ─── Suporte nativo (expo-notifications) ─────────────────────────────────────
let Notifications = null;
try {
  Notifications = require('expo-notifications');
  if (Notifications?.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
  // Canal obrigatório no Android 8+ para notificações locais funcionarem
  if (Platform.OS === 'android' && Notifications?.setNotificationChannelAsync) {
    Notifications.setNotificationChannelAsync('default', {
      name: 'AssisConnect',
      importance: Notifications.AndroidImportance?.MAX ?? 5,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    }).catch(() => {});
  }
} catch {}

export { isExpoGo };

// ─── Web Notifications API ────────────────────────────────────────────────────
function webSuportado() {
  return isWeb && typeof window !== 'undefined' && 'Notification' in window;
}

async function pedirPermissaoWeb() {
  if (!webSuportado()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function dispararNotificacaoWeb(titulo, corpo, icone = '/favicon.ico') {
  return new Notification(titulo, {
    body: corpo,
    icon: icone,
    badge: icone,
    tag: 'assisconnect',
  });
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function isSuportado() {
  if (isWeb) return webSuportado();
  return Notifications !== null;
}

export async function pedirPermissao() {
  if (isWeb) return pedirPermissaoWeb();
  if (!Notifications) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch { return false; }
}

export async function cancelarTodas() {
  if (isWeb) return; // Web não tem agendamento persistente
  if (!Notifications) return;
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
}

export async function testarAgora(titulo = 'AssisConnect', corpo = 'Notificação de teste!') {
  // Web: usa browser Notification API
  if (isWeb) {
    const permitido = await pedirPermissaoWeb();
    if (!permitido) return { sucesso: false, motivo: 'Permissão negada pelo navegador. Clique no cadeado na barra de endereço e permita notificações.' };
    try {
      setTimeout(() => dispararNotificacaoWeb(titulo, corpo), 500);
      return { sucesso: true };
    } catch (e) {
      return { sucesso: false, motivo: String(e) };
    }
  }
  // Native: usa expo-notifications
  if (!Notifications) return { sucesso: false, motivo: 'expo-notifications não instalado' };
  try {
    const permitido = await pedirPermissao();
    if (!permitido) return { sucesso: false, motivo: 'Permissão negada' };
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: corpo, sound: 'default' },
      trigger: {
        type: 'timeInterval',
        seconds: 2,
        repeats: false,
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
    });
    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, motivo: String(e) };
  }
}

export async function agendarLembreteDiario(hora = 8, minuto = 0) {
  if (isWeb) {
    // Web: agenda via setTimeout até meia-noite — não persiste após fechar o browser
    const agora = new Date();
    const alvo = new Date();
    alvo.setHours(hora, minuto, 0, 0);
    if (alvo <= agora) alvo.setDate(alvo.getDate() + 1);
    const ms = alvo.getTime() - agora.getTime();
    const id = setTimeout(async () => {
      const ok = await pedirPermissaoWeb();
      if (ok) dispararNotificacaoWeb('AssisConnect', 'Não esqueça de registrar a presença dos idosos hoje!');
    }, ms);
    return String(id);
  }
  if (!Notifications) return null;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'AssisConnect',
        body: 'Não esqueça de registrar a presença dos idosos hoje!',
        sound: 'default',
      },
      trigger: {
        type: 'daily',
        hour: hora,
        minute: minuto,
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
    });
  } catch (e) {
    console.log('[NOTIF] Erro ao agendar:', e);
    return null;
  }
}

export async function agendarAniversarios(listaIdosos) {
  if (isWeb || !Notifications || !Array.isArray(listaIdosos)) return 0;
  let count = 0;
  const hoje = new Date();
  for (const i of listaIdosos) {
    if (!i.dataNascimento) continue;
    try {
      const [, mes, dia] = i.dataNascimento.split('-').map(Number);
      const dataAniv = new Date(hoje.getFullYear(), mes - 1, dia, 9, 0, 0);
      if (dataAniv < hoje) dataAniv.setFullYear(dataAniv.getFullYear() + 1);
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Aniversário!', body: `Hoje é aniversário de ${i.nome}!`, sound: 'default' },
        trigger: {
          type: 'date',
          date: dataAniv,
          ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
        },
      });
      count++;
    } catch {}
  }
  return count;
}

export async function salvarConfig(config) {
  await AsyncStorage.setItem('@notificacoes_config', JSON.stringify(config));
}

export async function lerConfig() {
  try {
    const data = await AsyncStorage.getItem('@notificacoes_config');
    return data ? JSON.parse(data) : {
      lembreteDiarioAtivo: false,
      aniversariosAtivo: false,
      horaLembrete: 8,
      minutoLembrete: 0,
    };
  } catch {
    return { lembreteDiarioAtivo: false, aniversariosAtivo: false, horaLembrete: 8, minutoLembrete: 0 };
  }
}
