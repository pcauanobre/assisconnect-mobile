import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Carregamento defensivo do expo-notifications (caso ainda nao instalado)
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
} catch {
  console.log('[NOTIF] expo-notifications nao instalado. Rode: npx expo install expo-notifications');
}

const STORAGE_KEY = '@notificacoes_config';

export async function isSuportado() {
  return Notifications !== null && Platform.OS !== 'web';
}

export async function pedirPermissao() {
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
  if (!Notifications) return;
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
}

export async function agendarLembreteDiario(hora = 8, minuto = 0) {
  if (!Notifications) return null;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'AssisConnect',
        body: 'Nao esqueca de registrar a presenca dos idosos hoje!',
        sound: 'default',
      },
      trigger: {
        hour: hora,
        minute: minuto,
        repeats: true,
      },
    });
    return id;
  } catch (e) {
    console.log('[NOTIF] Erro ao agendar:', e);
    return null;
  }
}

export async function agendarAniversarios(listaIdosos) {
  if (!Notifications || !Array.isArray(listaIdosos)) return 0;
  let count = 0;
  const hoje = new Date();
  for (const i of listaIdosos) {
    if (!i.dataNascimento) continue;
    try {
      const partes = i.dataNascimento.split('-');
      const mes = parseInt(partes[1], 10);
      const dia = parseInt(partes[2], 10);
      // Agenda proximo aniversario
      let ano = hoje.getFullYear();
      const dataAniv = new Date(ano, mes - 1, dia, 9, 0, 0);
      if (dataAniv < hoje) dataAniv.setFullYear(ano + 1);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Aniversario!',
          body: `Hoje e aniversario de ${i.nome}!`,
          sound: 'default',
        },
        trigger: { date: dataAniv },
      });
      count++;
    } catch {}
  }
  return count;
}

export async function salvarConfig(config) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function testarAgora(titulo = 'Teste AssisConnect', corpo = 'Notificacao de teste!') {
  if (!Notifications) return { sucesso: false, motivo: 'expo-notifications nao instalado' };
  try {
    const permitido = await pedirPermissao();
    if (!permitido) return { sucesso: false, motivo: 'Permissao negada' };
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: corpo, sound: 'default' },
      trigger: { seconds: 2 },
    });
    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, motivo: String(e) };
  }
}

export async function lerConfig() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      lembreteDiarioAtivo: false,
      aniversariosAtivo: false,
      horaLembrete: 8,
    };
  } catch {
    return { lembreteDiarioAtivo: false, aniversariosAtivo: false, horaLembrete: 8 };
  }
}
