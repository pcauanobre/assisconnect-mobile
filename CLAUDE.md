=====================================================
  COMMITS LOCAIS - AssisConnect Mobile
  16 commits (salvos no PC, ainda nao no GitHub)
=====================================================


1. [47c4d5b] Configurar estrutura base do projeto mobile com navegacao e servicos
   Setup do React Native/Expo, navegacao Stack + Tabs, Axios,
   servicos de API, tema de cores, SafeAreaProvider.
   -> Requisito: RF01 - Estrutura Base do Sistema

2. [761106b] Implementar telas de autenticacao (login, cadastro, recuperar senha)
   Telas de login, registro e recuperacao de senha com validacao
   de campos e integracao com API de autenticacao.
   -> Requisito: RF02 - Autenticacao de Usuarios

3. [8bc7843] Criar tela de Dashboard com metricas e tela de perfil do usuario
   Dashboard com cards de estatisticas (total idosos, ativos, presenca),
   cardapio do dia, atalhos rapidos. Tela de perfil do usuario logado.
   -> Requisito: RF03 - Painel de Controle e Perfil do Usuario

4. [3fe0b86] Implementar modulo completo de gestao de idosos
   CRUD completo: listagem com busca e filtro, detalhe, cadastro,
   edicao, foto. Backend: controller, repository, entidade com
   campos (nome, nascimento, sexo, status, observacoes).
   -> Requisito: RF04 - Cadastro e Gestao de Idosos

5. [19a9737] Criar tela de cardapio semanal com edicao por dia
   Visualizacao dos 7 dias com almoco e jantar, edicao inline,
   cards expansiveis por dia, integracao com backend.
   -> Requisito: RF05 - Gerenciamento de Cardapio Semanal

6. [a301690] Implementar tela de registro diario de presenca
   Lista de idosos com checkbox de presenca, filtro por data,
   salvamento do registro, indicadores de presente/ausente.
   -> Requisito: RF06 - Registro Diario de Presenca

7. [b432650] Implementar tela de relatorio mensal com estatisticas
   Cards por mes, estatisticas (total, ativos, inativos, falecidos,
   novos, media idade, mais velho, mais novo), barra de genero,
   campo de observacoes, filtro por ano. Backend com endpoints
   de estatisticas e geracao automatica de relatorios.
   -> Requisito: RF07 - Relatorios Mensais e Estatisticas

8. [2b29668] Corrigir header duplicado no Dashboard e ajustar navegacao
   Correcao de bug visual, criacao do ScreenHeader padronizado (56px),
   migracao para material-top-tabs com swipe entre abas.
   -> Requisito: RNF01 - Padronizacao de Interface e Navegacao

9. [6195344] Adicionar estrutura base do frontend web (Spring Boot + Thymeleaf)
   Configuracao do Thymeleaf, templates base, layout padrao,
   rotas do servidor para paginas web.
   -> Requisito: RF08 - Interface Web do Sistema

10. [8f21fae] Adicionar paginas HTML do frontend web
    Paginas de listagem de idosos, cardapio, registro diario
    e relatorios com estilizacao CSS.
    -> Requisito: RF08 - Interface Web do Sistema (continuacao)

11. [fbf18ad] Adicionar logica JavaScript do frontend web
    Fetch API para comunicacao com backend, manipulacao de DOM,
    validacoes de formulario, formatacao de dados.
    -> Requisito: RF08 - Interface Web do Sistema (continuacao)

12. [df7c379] Criar funcoes utilitarias compartilhadas
    Funcoes de formatacao de datas, calculo de idade,
    validacao de campos, helpers de texto.
    -> Requisito: RNF02 - Funcoes Utilitarias Reutilizaveis

13. [fa16ad4] Atualizar configuracao CORS do backend para suportar app mobile
    CORS configurado para aceitar requisicoes do frontend web
    e do app mobile (Expo/React Native).
    -> Requisito: RNF03 - Configuracao de Seguranca (CORS)

14. [92d4612] Atualizar gitignore com regras para mobile e ambiente
    Regras para node_modules, .expo, target, IDEs, .env.
    -> Requisito: RNF04 - Configuracao de Ambiente

15. [3afcbfe] Adicionar estilos globais reutilizaveis do tema
    Cores padrao, estilos de card/botao/input reutilizaveis,
    consistencia visual no app.
    -> Requisito: RNF05 - Tema e Identidade Visual

16. [c6a1e02] Implementar sistema de relatorios mensais e melhorias gerais
    Backend: estatisticas acumuladas, query findAllCriadosAte,
    endpoint gerar-pendentes, filtro por ano, DTO com 11 campos.
    Frontend: swipe entre abas, headers padronizados, correcao
    de shadows, relatorio com cards expansiveis e badge "Mes atual".
    -> Requisito: RF07 - Relatorios Mensais e Estatisticas (evolucao)


=====================================================
  DISTRIBUICAO DE COMMITS POR MEMBRO
=====================================================

  Cabezas (gitCabezas): #1, #3, #8
  Caua (pcauanobre): #2, #6, #7, #16
  Lucas Ximenes (lucasximenes30): #5, #12, #13
  Lucas Rodrigues (lucaslemosdev): #4, #9, #14
  Nicolas Silveira (nicolasslveira): #10, #11, #15


=====================================================
  LISTA DE REQUISITOS
=====================================================

  FUNCIONAIS:
  RF01 - Estrutura Base do Sistema
  RF02 - Autenticacao de Usuarios
  RF03 - Painel de Controle e Perfil do Usuario
  RF04 - Cadastro e Gestao de Idosos
  RF05 - Gerenciamento de Cardapio Semanal
  RF06 - Registro Diario de Presenca
  RF07 - Relatorios Mensais e Estatisticas
  RF08 - Interface Web do Sistema

  NAO FUNCIONAIS:
  RNF01 - Padronizacao de Interface e Navegacao
  RNF02 - Funcoes Utilitarias Reutilizaveis
  RNF03 - Configuracao de Seguranca (CORS)
  RNF04 - Configuracao de Ambiente
  RNF05 - Tema e Identidade Visual


=====================================================
  REQUISITOS OPCIONAIS (sugestoes para implementar)
=====================================================

  RF09 - Notificacoes Push
    Enviar alerta diario para o funcionario lembrar de registrar
    presenca. Notificar quando um relatorio mensal estiver pronto.
    Lembrete de aniversario dos idosos.

  RF10 - Controle de Medicamentos
    Cadastro de medicamentos por idoso (nome, dosagem, horario).
    Checklist diario de medicacao administrada.
    Alerta quando o estoque estiver acabando.

  RF11 - Registro de Saude do Idoso
    Historico de peso, pressao arterial, glicemia por idoso.
    Grafico de evolucao ao longo dos meses.
    Campo para observacoes medicas e consultas.

  RF12 - Gestao de Atividades Recreativas
    Calendario de atividades (fisioterapia, artesanato, musica).
    Registro de participacao dos idosos em cada atividade.
    Relatorio de atividades mais frequentadas.

  RF13 - Controle de Visitas de Familiares
    Registro de visitas com data, hora, nome do visitante.
    Historico por idoso (quem visitou, quando).
    Alerta para idosos que nao recebem visita ha muito tempo.

  RF14 - Exportacao de Relatorios em PDF
    Gerar PDF dos relatorios mensais para impressao.
    Incluir logo do lar, dados estatisticos e graficos.
    Opcao de enviar por email ou compartilhar.

  RF15 - Modo Offline
    App funciona sem internet (dados salvos localmente).
    Sincroniza automaticamente quando voltar a conexao.
    Ideal para lares em areas com internet instavel.

  RF16 - Multi-Unidades (Filiais)
    Suporte a mais de um lar de idosos no mesmo sistema.
    Dashboard separado por unidade.
    Relatorios comparativos entre unidades.

  RNF06 - Acessibilidade
    Fontes ajustaveis para funcionarios com dificuldade visual.
    Contraste alto opcional.
    Suporte a leitor de tela.

  RNF07 - Backup Automatico do Banco de Dados
    Backup diario automatico do MySQL.
    Possibilidade de restaurar dados de uma data anterior.


=====================================================
  SPRINTS
=====================================================

  Sprint 1 (CONCLUIDA - 23/03 a 26/03/2026):
    Commits #1 a #5 (RF01 a RF05)
    Branch backup com todos os commits: backup/todos-commits

  Sprint 2+ (PENDENTE):
    Commits #6 a #16
