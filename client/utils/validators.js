// Valida CPF ou RG de forma simples (apenas máscara básica)
export function sanitizeCpfRg(value='') {
  return value.replace(/[^0-9]/g, '').slice(0, 14);
}

export function sanitizeCode(value='') {
  return value.replace(/[^0-9]/g, '').slice(0, 6);
}
