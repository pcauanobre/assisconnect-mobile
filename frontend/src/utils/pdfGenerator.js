import { Platform } from 'react-native';

// Carregamento defensivo - expo-print e expo-sharing podem nao estar instalados
let Print = null;
let Sharing = null;
try { Print = require('expo-print'); } catch {}
try { Sharing = require('expo-sharing'); } catch {}

function modulosDisponiveis() {
  return Print !== null;
}

function dataFormatada() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function calcularIdade(dataNasc) {
  if (!dataNasc) return '-';
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function notify(onFeedback, type, title, message) {
  if (typeof onFeedback === 'function') {
    onFeedback({ type, title, message });
  }
}

async function entregarPDF(html, fallbackName, onFeedback) {
  if (Platform.OS === 'web') {
    if (Print?.printAsync) {
      try {
        await Print.printAsync({ html });
        return;
      } catch {
        // fallback abaixo
      }
    }
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fallbackName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (Sharing && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } else {
      notify(onFeedback, 'success', 'PDF gerado', `Arquivo salvo em: ${uri}`);
    }
  } catch (e) {
    notify(onFeedback, 'error', 'Falha ao gerar PDF', String(e));
  }
}

// Paleta compartilhada entre templates — espelha o tema do app
const PALETA = {
  primary: '#3D1F0C',
  primaryDark: '#2c1a0f',
  text: '#1f1410',
  textMuted: '#6b5a52',
  surface: '#faf7f5',
  surfaceAlt: '#f2eeec',
  border: '#e3d8d2',
  ativo: '#16a34a',
  inativo: '#f59e0b',
  falecido: '#6b5a52',
  novo: '#0ea5e9',
};

function headerStrip(titulo, subtitulo) {
  return `
    <div class="cabecalho-strip">
      <div class="strip-marca">
        <div class="strip-logo">AC</div>
        <div class="strip-textos">
          <div class="strip-titulo">${titulo}</div>
          <div class="strip-subtitulo">${subtitulo}</div>
        </div>
      </div>
      <div class="strip-data">${dataFormatada()}</div>
    </div>
  `;
}

const cssBase = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, "Segoe UI", "Inter", Roboto, Helvetica, Arial, sans-serif;
    color: ${PALETA.text};
    padding: 28px 32px;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cabecalho-strip {
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(135deg, ${PALETA.primary} 0%, ${PALETA.primaryDark} 100%);
    color: #fff;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 22px;
  }
  .strip-marca { display: flex; align-items: center; gap: 14px; }
  .strip-logo {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 16px; letter-spacing: 1px;
  }
  .strip-titulo { font-size: 17px; font-weight: 800; line-height: 1.2; }
  .strip-subtitulo { font-size: 11px; opacity: 0.85; margin-top: 2px; letter-spacing: 0.2px; }
  .strip-data { font-size: 11px; opacity: 0.85; }
  h2 {
    color: ${PALETA.primary}; font-size: 14px; font-weight: 800;
    margin-top: 22px; margin-bottom: 10px;
    text-transform: uppercase; letter-spacing: 0.6px;
    padding-bottom: 6px; border-bottom: 2px solid ${PALETA.border};
  }
  .stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  }
  .stat-card {
    background: ${PALETA.surface};
    border-left: 4px solid ${PALETA.primary};
    border-radius: 8px;
    padding: 12px 14px;
  }
  .stat-card.ativo { border-left-color: ${PALETA.ativo}; }
  .stat-card.inativo { border-left-color: ${PALETA.inativo}; }
  .stat-card.falecido { border-left-color: ${PALETA.falecido}; }
  .stat-card.novo { border-left-color: ${PALETA.novo}; }
  .stat-value { font-size: 22px; font-weight: 800; color: ${PALETA.primary}; line-height: 1.1; }
  .stat-card.ativo .stat-value { color: ${PALETA.ativo}; }
  .stat-card.inativo .stat-value { color: ${PALETA.inativo}; }
  .stat-card.falecido .stat-value { color: ${PALETA.falecido}; }
  .stat-card.novo .stat-value { color: ${PALETA.novo}; }
  .stat-label { font-size: 10px; color: ${PALETA.textMuted}; margin-top: 4px; letter-spacing: 0.3px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  td { padding: 8px 10px; border-bottom: 1px solid ${PALETA.border}; font-size: 12px; }
  td.label { font-weight: 700; color: ${PALETA.textMuted}; width: 40%; }
  .barra-genero {
    display: flex; width: 100%; height: 14px; border-radius: 8px;
    overflow: hidden; margin-top: 8px; border: 1px solid ${PALETA.border};
  }
  .barra-fem { background: #ec4899; }
  .barra-masc { background: #3b82f6; }
  .barra-legenda {
    display: flex; gap: 18px; margin-top: 8px; font-size: 11px; color: ${PALETA.textMuted};
  }
  .barra-legenda .dot {
    display: inline-block; width: 10px; height: 10px; border-radius: 5px; margin-right: 6px; vertical-align: middle;
  }
  .obs-box {
    background: ${PALETA.surfaceAlt}; border-radius: 8px;
    padding: 12px 14px; font-size: 12px; line-height: 1.55; color: ${PALETA.text};
  }
  .status {
    display: inline-block; padding: 2px 9px; border-radius: 10px;
    font-size: 10px; font-weight: 700; color: #fff; letter-spacing: 0.3px;
  }
  .status-ativo { background: ${PALETA.ativo}; }
  .status-inativo { background: ${PALETA.inativo}; }
  .status-falecido { background: ${PALETA.falecido}; }
  .footer {
    margin-top: 28px; padding-top: 12px;
    border-top: 1px solid ${PALETA.border};
    color: ${PALETA.textMuted}; font-size: 10px; text-align: center;
    letter-spacing: 0.2px;
  }
`;

export async function gerarPDFRelatorio(relatorio, mes, ano, onFeedback) {
  if (!modulosDisponiveis() && Platform.OS !== 'web') {
    notify(onFeedback, 'error', 'PDF nao disponivel', 'Instale: npx expo install expo-print expo-sharing');
    return;
  }

  const MESES = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const stats = relatorio?.estatisticas || relatorio || {};
  const idosos = relatorio?.idosos || [];
  const obs = relatorio?.observacoes || '';
  const pctF = Number(stats.percentualFeminino || 0);
  const pctM = Number(stats.percentualMasculino || 0);

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>${cssBase}</style></head>
    <body>
      ${headerStrip(`Relatorio Mensal — ${MESES[mes - 1]} / ${ano}`, 'AssisConnect — Gestao de Lar de Idosos')}

      <h2>Indicadores do mes</h2>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${stats.quantidadeIdosos || 0}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card ativo">
          <div class="stat-value">${stats.idososAtivos || 0}</div>
          <div class="stat-label">Ativos</div>
        </div>
        <div class="stat-card inativo">
          <div class="stat-value">${stats.idososInativos || 0}</div>
          <div class="stat-label">Inativos</div>
        </div>
        <div class="stat-card falecido">
          <div class="stat-value">${stats.idososFalecidos || 0}</div>
          <div class="stat-label">Falecidos</div>
        </div>
        <div class="stat-card novo">
          <div class="stat-value">${stats.novosCadastros || 0}</div>
          <div class="stat-label">Novos no mes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(Number(stats.mediaIdade) || 0).toFixed(1)}</div>
          <div class="stat-label">Media de idade</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.idosoMaisVelho || '-'}</div>
          <div class="stat-label">Mais velho</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.idosoMaisNovo || '-'}</div>
          <div class="stat-label">Mais novo</div>
        </div>
      </div>

      <h2>Distribuicao por genero</h2>
      <div class="barra-genero">
        ${pctF > 0 ? `<div class="barra-fem" style="flex:${pctF};"></div>` : ''}
        ${pctM > 0 ? `<div class="barra-masc" style="flex:${pctM};"></div>` : ''}
      </div>
      <div class="barra-legenda">
        <span><span class="dot" style="background:#ec4899;"></span>Feminino — ${pctF.toFixed(1)}%</span>
        <span><span class="dot" style="background:#3b82f6;"></span>Masculino — ${pctM.toFixed(1)}%</span>
      </div>

      ${idosos.length > 0 ? `
        <h2>Residentes (${idosos.length})</h2>
        <table>
          ${idosos.map(i => `
            <tr>
              <td style="width: 50%;">${i.nome || '-'}</td>
              <td>${calcularIdade(i.dataNascimento)} anos — ${i.sexo || '-'}</td>
              <td style="width: 25%;">
                <span class="status status-${i.falecido ? 'falecido' : i.inativo ? 'inativo' : 'ativo'}">
                  ${i.falecido ? 'Falecido' : i.inativo ? 'Inativo' : 'Ativo'}
                </span>
              </td>
            </tr>
          `).join('')}
        </table>
      ` : ''}

      ${obs ? `
        <h2>Observacoes</h2>
        <div class="obs-box">${obs.replace(/\n/g, '<br>')}</div>
      ` : ''}

      <div class="footer">
        AssisConnect v1.0 — Documento gerado automaticamente em ${dataFormatada()}<br>
        UNIFOR — N393 Projeto Aplicado Multiplataforma
      </div>
    </body></html>
  `;

  const nome = `relatorio-${String(mes).padStart(2, '0')}-${ano}`;
  await entregarPDF(html, nome, onFeedback);
}

export async function gerarPDFFichaIdoso(idoso, registrosSaude = [], medicamentos = [], visitas = [], onFeedback) {
  if (!modulosDisponiveis() && Platform.OS !== 'web') {
    notify(onFeedback, 'error', 'PDF nao disponivel', 'Instale: npx expo install expo-print expo-sharing');
    return;
  }

  const fmt = (d) => {
    if (!d) return '-';
    const p = String(d).split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
  };

  const statusLabel = idoso.falecido ? 'Falecido' : idoso.inativo ? 'Inativo' : 'Ativo';
  const statusClass = idoso.falecido ? 'status-falecido' : idoso.inativo ? 'status-inativo' : 'status-ativo';
  const iniciais = (idoso.nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const fotoHtml = idoso.fotoUrl
    ? `<img src="${idoso.fotoUrl}" class="ficha-foto" />`
    : `<div class="ficha-foto ficha-foto-placeholder">${iniciais}</div>`;

  const ultSaude = (Array.isArray(registrosSaude) ? registrosSaude : []).slice(0, 5);
  const ultMeds = (Array.isArray(medicamentos) ? medicamentos : []).slice(0, 5);
  const ultVisitas = (Array.isArray(visitas) ? visitas : []).slice(0, 5);

  const cssFicha = `
    ${cssBase}
    @page { size: A4; margin: 12mm; }
    body { padding: 22px 26px; font-size: 11px; }
    .strip-titulo { font-size: 15px; }
    h2 { margin-top: 14px; font-size: 12px; }
    .topo { display: flex; gap: 16px; margin-bottom: 4px; }
    .ficha-foto {
      width: 120px; height: 150px; border-radius: 10px;
      border: 3px solid ${PALETA.primary};
      object-fit: cover; flex-shrink: 0;
    }
    .ficha-foto-placeholder {
      background: ${PALETA.surfaceAlt};
      display: flex; align-items: center; justify-content: center;
      font-size: 40px; font-weight: 800; color: ${PALETA.primary};
      letter-spacing: 2px;
    }
    .ficha-nome { font-size: 13px; font-weight: 800; color: ${PALETA.primary}; margin-top: 6px; max-width: 126px; word-wrap: break-word; }
    .ficha-foto-col { text-align: center; flex-shrink: 0; }
    .ficha-info-col { flex: 1; }
    .kv { width: 100%; border-collapse: collapse; }
    .kv td { padding: 3px 4px; font-size: 10px; vertical-align: top; border-bottom: none; }
    .kv td.k { font-weight: 700; color: ${PALETA.textMuted}; white-space: nowrap; width: 28%; text-transform: uppercase; letter-spacing: 0.3px; }
    .dt { width: 100%; border-collapse: collapse; margin-top: 4px; }
    .dt th {
      background: ${PALETA.primary}; color: #fff;
      padding: 5px 7px; font-size: 10px; text-align: left; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.3px;
    }
    .dt td { padding: 4px 7px; font-size: 10px; border-bottom: 1px solid ${PALETA.border}; vertical-align: top; }
    .dt tr:nth-child(even) td { background: ${PALETA.surface}; }
    .vazio { font-size: 10px; color: ${PALETA.textMuted}; font-style: italic; padding: 6px 7px; }
    .tag-ativo, .tag-inativo {
      display: inline-block; padding: 1px 8px; border-radius: 8px;
      font-size: 9px; font-weight: 700; color: #fff; letter-spacing: 0.3px;
    }
    .tag-ativo { background: ${PALETA.ativo}; }
    .tag-inativo { background: ${PALETA.textMuted}; }
  `;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${cssFicha}</style></head>
<body>
${headerStrip('Ficha do Idoso', 'Documento de uso interno da instituicao')}

<div class="topo">
  <div class="ficha-foto-col">
    ${fotoHtml}
    <div class="ficha-nome">${idoso.nome || '-'}</div>
    <span class="status ${statusClass}" style="margin-top:6px; display:inline-block;">${statusLabel}</span>
  </div>
  <div class="ficha-info-col">
    <h2 style="margin-top:0;">Dados pessoais</h2>
    <table class="kv">
      <tr><td class="k">Sexo</td><td>${idoso.sexo || '-'}</td><td class="k">Nascimento</td><td>${fmt(idoso.dataNascimento)}</td></tr>
      <tr><td class="k">Idade</td><td>${calcularIdade(idoso.dataNascimento)} anos</td><td class="k">Est. Civil</td><td>${idoso.estadoCivil || '-'}</td></tr>
      <tr><td class="k">RG</td><td>${idoso.rg || '-'}</td><td class="k">CPF</td><td>${idoso.cpf || '-'}</td></tr>
    </table>

    <h2>Contato</h2>
    <table class="kv">
      <tr><td class="k">Telefone</td><td>${idoso.telefoneIdoso || '-'}</td><td class="k">Responsavel</td><td>${idoso.responsavel || '-'}</td></tr>
      <tr><td class="k">Tel. Resp.</td><td>${idoso.telefoneResponsavel || '-'}</td><td class="k">Plano</td><td>${idoso.planoSaude || '-'}</td></tr>
      <tr><td class="k">Endereco</td><td colspan="3">${[idoso.endereco, idoso.cidade, idoso.estado, idoso.cep].filter(Boolean).join(', ') || '-'}</td></tr>
    </table>

    <h2>Condicoes de saude</h2>
    <table class="kv">
      <tr><td class="k">Doencas</td><td colspan="3">${idoso.doencas || '-'}</td></tr>
      <tr><td class="k">Alergias</td><td colspan="3">${idoso.alergias || '-'}</td></tr>
      <tr><td class="k">Deficiencias</td><td colspan="3">${idoso.deficiencias || '-'}</td></tr>
    </table>
  </div>
</div>

<h2>Ultimos registros de saude</h2>
${ultSaude.length > 0 ? `
<table class="dt">
  <thead><tr><th>Data</th><th>Peso</th><th>Pressao</th><th>Temp.</th><th>Glicemia</th><th>Observacoes</th></tr></thead>
  <tbody>
    ${ultSaude.map(r => `<tr>
      <td>${fmt(r.data)}</td>
      <td>${r.peso != null ? r.peso + ' kg' : '-'}</td>
      <td>${r.pressaoSistolica != null ? r.pressaoSistolica + '/' + r.pressaoDiastolica : '-'}</td>
      <td>${r.temperatura != null ? r.temperatura + ' °C' : '-'}</td>
      <td>${r.glicemia != null ? r.glicemia + ' mg/dL' : '-'}</td>
      <td>${r.observacoes || '-'}</td>
    </tr>`).join('')}
  </tbody>
</table>` : `<div class="vazio">Nenhum registro de saude cadastrado.</div>`}

<h2>Medicamentos</h2>
${ultMeds.length > 0 ? `
<table class="dt">
  <thead><tr><th>Medicamento</th><th>Dosagem</th><th>Horarios</th><th>Frequencia</th><th>Situacao</th></tr></thead>
  <tbody>
    ${ultMeds.map(m => `<tr>
      <td><strong>${m.nome || '-'}</strong></td>
      <td>${m.dosagem || '-'}</td>
      <td>${m.horarios || '-'}</td>
      <td>${m.frequencia || '-'}</td>
      <td><span class="${m.ativo ? 'tag-ativo' : 'tag-inativo'}">${m.ativo ? 'Ativo' : 'Inativo'}</span></td>
    </tr>`).join('')}
  </tbody>
</table>` : `<div class="vazio">Nenhum medicamento cadastrado.</div>`}

<h2>Ultimas visitas</h2>
${ultVisitas.length > 0 ? `
<table class="dt">
  <thead><tr><th>Data</th><th>Visitante</th><th>Parentesco</th><th>Observacoes</th></tr></thead>
  <tbody>
    ${ultVisitas.map(v => `<tr>
      <td>${fmt(v.dataVisita)}</td>
      <td>${v.nomeVisitante || '-'}</td>
      <td>${v.parentesco || '-'}</td>
      <td>${v.observacoes || '-'}</td>
    </tr>`).join('')}
  </tbody>
</table>` : `<div class="vazio">Nenhuma visita registrada.</div>`}

<div class="footer">
  AssisConnect v1.0 — Ficha gerada automaticamente em ${dataFormatada()} &nbsp;|&nbsp; UNIFOR — N393 Projeto Aplicado Multiplataforma
</div>

</body></html>`;

  const nome = `ficha-${(idoso.nome || 'idoso').replace(/\s+/g, '-').toLowerCase()}`;
  await entregarPDF(html, nome, onFeedback);
}
