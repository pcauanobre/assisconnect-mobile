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

export async function gerarPDFFichaIdoso(idoso) {
  if (!modulosDisponiveis()) {
    Alert.alert('PDF nao disponivel', 'Instale: npx expo install expo-print expo-sharing');
    return;
  }

  const status = idoso.falecido ? 'Falecido' : idoso.inativo ? 'Inativo' : 'Ativo';
  const statusClass = idoso.falecido ? 'falecido' : idoso.inativo ? 'inativo' : 'ativo';

  const secoes = [
    {
      titulo: 'Dados Pessoais',
      campos: [
        ['Nome', idoso.nome],
        ['Sexo', idoso.sexo],
        ['Data de Nascimento', idoso.dataNascimento],
        ['Idade', `${calcularIdade(idoso.dataNascimento)} anos`],
        ['Estado Civil', idoso.estadoCivil],
        ['RG', idoso.rg],
        ['CPF', idoso.cpf],
      ],
    },
    {
      titulo: 'Endereco e Contato',
      campos: [
        ['Endereco', idoso.endereco],
        ['Cidade', idoso.cidade],
        ['Estado', idoso.estado],
        ['CEP', idoso.cep],
        ['Telefone', idoso.telefoneIdoso],
        ['Responsavel', idoso.responsavel],
        ['Tel. Responsavel', idoso.telefoneResponsavel],
      ],
    },
    {
      titulo: 'Saude',
      campos: [
        ['Doencas', idoso.doencas],
        ['Alergias', idoso.alergias],
        ['Plano de Saude', idoso.planoSaude],
        ['Deficiencias', idoso.deficiencias],
        ['Observacoes', idoso.observacoes],
      ],
    },
  ];

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>${estiloBase}</style></head>
    <body>
      <div class="header">
        <div class="logo">👤</div>
        <h1>Ficha do Idoso</h1>
        <div class="subtitle">AssisConnect — Gerado em ${dataFormatada()}</div>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <span class="status status-${statusClass}">${status}</span>
      </div>

      ${secoes.map(s => `
        <h2>${s.titulo}</h2>
        <table>
          ${s.campos.map(([l, v]) => `
            <tr><td class="label">${l}</td><td>${v || '-'}</td></tr>
          `).join('')}
        </table>
      `).join('')}

      <div class="footer">
        AssisConnect v1.0 — Ficha gerada automaticamente<br>
        Documento de uso interno da instituicao
      </div>
    </body></html>
  `;

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
