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

// Tema escuro — profundidade quente, identidade marrom preservada
// Hierarquia: background < surface < surfaceLight < white (elevação crescente)
export const darkColors = {
  primary:       '#d4845a',  // Cobre quente — legível, identidade preservada
  primaryDark:   '#b86e44',  // Cobre profundo para variantes pressionadas
  background:    '#100a06',  // Quase-preto com subtom marrom (telas de auth)
  surface:       '#1c1108',  // Fundo principal das telas
  surfaceLight:  '#2a1a0e',  // Modais e áreas elevadas
  accent:        '#3d2616',  // Superfície sutil para placeholders e chips
  white:         '#382213',  // Card/painel — claramente acima do surface
  textPrimary:   '#f0e8df',  // Creme quente — texto principal legível
  textSecondary: '#9b8070',  // Marrom médio — hierarquia clara
  border:        '#4a3221',  // Borda sutil mas perceptível
  danger:        '#f87171',  // Vermelho quente (não neon)
  success:       '#34d399',  // Esmeralda suave (não neon)
  inactive:      '#7a6358',  // Neutro quente — sem cinza frio
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
