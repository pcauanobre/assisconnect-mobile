// Paleta padrão (tema claro)
const colors = {
  primary:       '#3D1F0C',
  primaryDark:   '#2c1a0f',
  background:    '#4b2a14',
  surface:       '#f2eeec',
  surfaceLight:  '#fdf9f6',
  accent:        '#e5d2bd',
  white:         '#ffffff',
  textPrimary:   '#2c1a0f',
  textSecondary: '#6b5a52',
  border:        '#d3c7c1',
  danger:        '#dc2626',
  success:       '#16a34a',
  inactive:      '#9CA3AF',
};

// Tema escuro — padrão Material Design (sem identidade marrom)
// Hierarquia: background < surface < surfaceLight < white (elevação crescente)
export const darkColors = {
  primary:       '#3b82f6',  // Azul material — accent padrão dark
  primaryDark:   '#2563eb',  // Azul profundo para pressed
  background:    '#121212',  // Material Design dark base
  surface:       '#1e1e1e',  // Cards/elevation 1
  surfaceLight:  '#2a2a2a',  // Cards/elevation 2 (modais)
  accent:        '#3a3a3a',  // Chip/placeholder bg
  white:         '#1e1e1e',  // "Card branco" no dark = surface elevado
  textPrimary:   '#e8e8e8',  // Texto principal — legível
  textSecondary: '#9e9e9e',  // Texto secundário — hierarquia
  border:        '#3a3a3a',  // Borda sutil
  danger:        '#ef4444',  // Vermelho neutro
  success:       '#22c55e',  // Verde neutro
  inactive:      '#6b6b6b',  // Cinza neutro
};

// Alto contraste — tema claro de alta legibilidade, brand-aware
// Todos os tokens passam WCAG AA (4.5:1) e a maioria passa AAA (7:1)
export const highContrastColors = {
  primary:       '#7c2d12',  // Marrom-cobre profundo — 5.8:1 sobre branco
  primaryDark:   '#431407',  // Quase-preto quente para pressed states
  background:    '#ffffff',  // Branco limpo
  surface:       '#ffffff',  // Branco limpo
  surfaceLight:  '#fff8f5',  // Branco com subtom quente mínimo
  accent:        '#fef3e2',  // Âmbar claro para áreas de destaque
  white:         '#ffffff',  // Branco
  textPrimary:   '#1c0d04',  // Quase-preto com subtom quente — ~18:1 sobre branco
  textSecondary: '#3d1f0c',  // Primary da marca como texto secundário — ~11:1
  border:        '#1c0d04',  // Borda muito visível
  danger:        '#991b1b',  // Vermelho profundo — 7.2:1 sobre branco
  success:       '#14532d',  // Verde profundo — 9.1:1 sobre branco
  inactive:      '#57534e',  // Pedra quente
};

export default colors;
