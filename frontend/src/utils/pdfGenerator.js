import { Platform, Alert } from 'react-native';

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

const estiloBase = `
  body { font-family: -apple-system, sans-serif; padding: 30px; color: #2c1a0f; }
  h1 { color: #3D1F0C; font-size: 24px; margin-bottom: 4px; border-bottom: 3px solid #3D1F0C; padding-bottom: 8px; }
  h2 { color: #3D1F0C; font-size: 17px; margin-top: 22px; margin-bottom: 10px; }
  .header { text-align: center; margin-bottom: 20px; }
  .logo { width: 60px; height: 60px; border-radius: 30px; background: #3D1F0C; color: #fff;
          display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 10px; }
  .subtitle { color: #6b5a52; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 13px; }
  td.label { font-weight: 700; color: #6b5a52; width: 40%; }
  .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
  .stat-card { background: #f2eeec; padding: 14px; border-radius: 8px; text-align: center; }
  .stat-value { font-size: 22px; font-weight: 800; color: #3D1F0C; }
  .stat-label { font-size: 11px; color: #6b5a52; margin-top: 3px; }
  .footer { margin-top: 30px; padding-top: 14px; border-top: 1px solid #ddd; color: #6b5a52; font-size: 11px; text-align: center; }
  .status { display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; color: #fff; }
  .status-ativo { background: #16a34a; }
  .status-inativo { background: #f59e0b; }
  .status-falecido { background: #6b5a52; }
`;

export async function gerarPDFRelatorio(relatorio, mes, ano) {
  if (!modulosDisponiveis()) {
    Alert.alert('PDF nao disponivel', 'Instale: npx expo install expo-print expo-sharing');
    return;
  }

  const MESES = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const stats = relatorio?.estatisticas || relatorio || {};
  const idosos = relatorio?.idosos || [];
  const obs = relatorio?.observacoes || '';

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>${estiloBase}</style></head>
    <body>
      <div class="header">
        <div class="logo">🏥</div>
        <h1>Relatorio Mensal — ${MESES[mes - 1]} / ${ano}</h1>
        <div class="subtitle">AssisConnect — Gerado em ${dataFormatada()}</div>
      </div>

      <h2>Estatisticas</h2>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${stats.quantidadeIdosos || 0}</div>
          <div class="stat-label">Total de Idosos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.idososAtivos || 0}</div>
          <div class="stat-label">Ativos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.idososInativos || 0}</div>
          <div class="stat-label">Inativos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.idososFalecidos || 0}</div>
          <div class="stat-label">Falecidos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.novosCadastros || 0}</div>
          <div class="stat-label">Novos Cadastros</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(stats.mediaIdade || 0).toFixed(1)}</div>
          <div class="stat-label">Media de Idade</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.idosoMaisVelho || 0}</div>
          <div class="stat-label">Idade Mais Alta</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.idosoMaisNovo || 0}</div>
          <div class="stat-label">Idade Mais Baixa</div>
        </div>
      </div>

      <h2>Distribuicao por Genero</h2>
      <table>
        <tr><td class="label">Feminino</td><td>${(stats.percentualFeminino || 0).toFixed(1)}%</td></tr>
        <tr><td class="label">Masculino</td><td>${(stats.percentualMasculino || 0).toFixed(1)}%</td></tr>
      </table>

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
        <p style="font-size: 13px; line-height: 1.6;">${obs.replace(/\n/g, '<br>')}</p>
      ` : ''}

      <div class="footer">
        AssisConnect v1.0 — Documento gerado automaticamente<br>
        UNIFOR — N393 Projeto Aplicado Multiplataforma
      </div>
    </body></html>
  `;

  if (Platform.OS === 'web') {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${String(mes).padStart(2, '0')}-${ano}.html`;
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
      Alert.alert('PDF gerado', `Arquivo salvo em: ${uri}`);
    }
  } catch (e) {
    Alert.alert('Erro', 'Falha ao gerar PDF: ' + String(e));
  }
}

export async function gerarPDFFichaIdoso(idoso, registrosSaude = [], medicamentos = [], visitas = []) {
  if (!modulosDisponiveis() && Platform.OS !== 'web') {
    Alert.alert('PDF nao disponivel', 'Instale: npx expo install expo-print expo-sharing');
    return;
  }

  const fmt = (d) => {
    if (!d) return '-';
    const p = String(d).split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
  };

  const statusLabel = idoso.falecido ? 'Falecido' : idoso.inativo ? 'Inativo' : 'Ativo';
  const statusBg = idoso.falecido ? '#6b5a52' : idoso.inativo ? '#f59e0b' : '#16a34a';

  const iniciais = (idoso.nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const fotoHtml = idoso.fotoUrl
    ? `<img src="${idoso.fotoUrl}" style="width:120px;height:155px;object-fit:cover;border-radius:8px;border:3px solid #3D1F0C;" />`
    : `<div style="width:120px;height:155px;border-radius:8px;border:3px solid #3D1F0C;background:#f2eeec;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:800;color:#3D1F0C;letter-spacing:2px;">${iniciais}</div>`;

  const ultSaude = (Array.isArray(registrosSaude) ? registrosSaude : []).slice(0, 5);
  const ultMeds  = (Array.isArray(medicamentos)    ? medicamentos    : []).slice(0, 5);
  const ultVisitas = (Array.isArray(visitas)        ? visitas         : []).slice(0, 5);

  const estiloFicha = `
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #1a1a1a; }
    .cabecalho { display: flex; align-items: center; border-bottom: 2.5px solid #3D1F0C; padding-bottom: 7px; margin-bottom: 9px; }
    .cab-logo { width: 38px; height: 38px; background: #3D1F0C; border-radius: 50%; color: #fff; font-size: 20px; display: flex; align-items: center; justify-content: center; margin-right: 9px; flex-shrink: 0; }
    .cab-titulo { flex: 1; }
    .cab-titulo h1 { font-size: 13pt; color: #3D1F0C; }
    .cab-titulo p { font-size: 7.5pt; color: #666; margin-top: 1px; }
    .cab-data { font-size: 7.5pt; color: #666; text-align: right; }
    .topo { display: flex; gap: 14px; margin-bottom: 9px; }
    .foto-col { flex-shrink: 0; text-align: center; }
    .foto-nome { font-size: 9.5pt; font-weight: bold; color: #3D1F0C; margin-top: 6px; max-width: 126px; word-wrap: break-word; }
    .status-badge { display: inline-block; margin-top: 4px; padding: 2px 10px; border-radius: 10px; font-size: 7.5pt; font-weight: bold; color: #fff; }
    .info-col { flex: 1; }
    .sec-title { font-size: 8pt; font-weight: bold; color: #3D1F0C; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #d4a57a; padding-bottom: 2px; margin-bottom: 4px; margin-top: 7px; }
    .info-col .sec-title:first-child { margin-top: 0; }
    .kv { width: 100%; border-collapse: collapse; }
    .kv td { padding: 1.5px 3px; font-size: 8pt; vertical-align: top; }
    .kv td.k { font-weight: bold; color: #6b5a52; white-space: nowrap; width: 36%; }
    .dt { width: 100%; border-collapse: collapse; margin-top: 2px; }
    .dt th { background: #3D1F0C; color: #fff; padding: 3px 5px; font-size: 7.5pt; text-align: left; font-weight: bold; }
    .dt td { padding: 2.5px 5px; font-size: 8pt; border-bottom: 1px solid #eee; vertical-align: top; }
    .dt tr:nth-child(even) td { background: #faf7f5; }
    .vazio { font-size: 8pt; color: #999; font-style: italic; padding: 4px 5px; }
    .tag-ativo { display: inline-block; padding: 1px 7px; border-radius: 8px; font-size: 7pt; font-weight: bold; color: #fff; background: #16a34a; }
    .tag-inativo { display: inline-block; padding: 1px 7px; border-radius: 8px; font-size: 7pt; font-weight: bold; color: #fff; background: #999; }
    .rodape { margin-top: 9px; border-top: 1px solid #ddd; padding-top: 6px; text-align: center; font-size: 7pt; color: #999; }
  `;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${estiloFicha}</style></head>
<body>

<div class="cabecalho">
  <div class="cab-logo">&#128100;</div>
  <div class="cab-titulo">
    <h1>Ficha do Idoso — AssisConnect</h1>
    <p>Documento de uso interno da instituicao</p>
  </div>
  <div class="cab-data">Gerado em ${dataFormatada()}</div>
</div>

<div class="topo">
  <div class="foto-col">
    ${fotoHtml}
    <div class="foto-nome">${idoso.nome || '-'}</div>
    <span class="status-badge" style="background:${statusBg};">${statusLabel}</span>
  </div>
  <div class="info-col">
    <div class="sec-title">Dados Pessoais</div>
    <table class="kv">
      <tr><td class="k">Sexo</td><td>${idoso.sexo || '-'}</td><td class="k">Nascimento</td><td>${fmt(idoso.dataNascimento)}</td></tr>
      <tr><td class="k">Idade</td><td>${calcularIdade(idoso.dataNascimento)} anos</td><td class="k">Estado Civil</td><td>${idoso.estadoCivil || '-'}</td></tr>
      <tr><td class="k">RG</td><td>${idoso.rg || '-'}</td><td class="k">CPF</td><td>${idoso.cpf || '-'}</td></tr>
    </table>

    <div class="sec-title">Contato</div>
    <table class="kv">
      <tr><td class="k">Telefone</td><td>${idoso.telefoneIdoso || '-'}</td><td class="k">Responsavel</td><td>${idoso.responsavel || '-'}</td></tr>
      <tr><td class="k">Tel. Resp.</td><td>${idoso.telefoneResponsavel || '-'}</td><td class="k">Plano Saude</td><td>${idoso.planoSaude || '-'}</td></tr>
      <tr><td class="k">Endereco</td><td colspan="3">${[idoso.endereco, idoso.cidade, idoso.estado, idoso.cep].filter(Boolean).join(', ') || '-'}</td></tr>
    </table>

    <div class="sec-title">Condicoes de Saude</div>
    <table class="kv">
      <tr><td class="k">Doencas</td><td colspan="3">${idoso.doencas || '-'}</td></tr>
      <tr><td class="k">Alergias</td><td colspan="3">${idoso.alergias || '-'}</td></tr>
      <tr><td class="k">Deficiencias</td><td colspan="3">${idoso.deficiencias || '-'}</td></tr>
    </table>
  </div>
</div>

<div class="sec-title">Ultimos Registros de Saude</div>
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

<div class="sec-title">Medicamentos</div>
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

<div class="sec-title">Ultimas Visitas</div>
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

<div class="rodape">
  AssisConnect v1.0 — Ficha gerada automaticamente em ${dataFormatada()} &nbsp;|&nbsp; UNIFOR — N393 Projeto Aplicado Multiplataforma
</div>

</body></html>`;

  if (Platform.OS === 'web') {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha-${(idoso.nome || 'idoso').replace(/\s+/g, '-').toLowerCase()}.html`;
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
      Alert.alert('PDF gerado', `Arquivo salvo em: ${uri}`);
    }
  } catch (e) {
    Alert.alert('Erro', 'Falha ao gerar PDF: ' + String(e));
  }
}
