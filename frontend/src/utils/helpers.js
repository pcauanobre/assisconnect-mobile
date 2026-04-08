export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return 0;
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export function formatarData(dataStr) {
  if (!dataStr) return '-';
  const partes = dataStr.split('-');
  if (partes.length !== 3) return dataStr;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function getDataHoje() {
  return new Date().toISOString().split('T')[0];
}

export function getHoraAtual() {
  return new Date().toTimeString().split(' ')[0];
}
