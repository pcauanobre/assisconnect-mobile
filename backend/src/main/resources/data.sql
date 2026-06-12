-- ============================================================
--  SEED H2 — carregado automaticamente ao subir o backend
-- ============================================================

-- Usuário admin
INSERT INTO usuario (usuario, senha, email, nome, telefone, administrador)
VALUES ('pedro', 'pedro123', 'pedrocauaggn@gmail.com', 'Pedro Caua', '(11) 99999-0001', true);

-- Idosos
INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Maria Aparecida Silva',   'F', '1942-05-14', 'Viuva',      'Carlos Silva',     '(11) 98888-0001', 'Hipertensao, Diabetes',  'Necessita dieta especial',   '2025-01-10', false, false, 'https://randomuser.me/api/portraits/women/60.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Jose Benedito Santos',    'M', '1938-11-03', 'Casado',     'Ana Santos',       '(11) 98888-0002', 'Artrite',                'Usa andador',                '2025-01-15', false, false, 'https://randomuser.me/api/portraits/men/72.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Rosa de Fatima Oliveira', 'F', '1945-08-22', 'Solteira',   'Paulo Oliveira',   '(11) 98888-0003', 'Alzheimer leve',         'Acompanhamento semanal',     '2025-02-01', false, false, 'https://randomuser.me/api/portraits/women/65.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Antonio Ferreira Lima',   'M', '1940-02-17', 'Viuvo',      'Marcos Lima',      '(11) 98888-0004', 'Insuficiencia cardiaca', 'Repouso apos procedimento',  '2025-02-10', false, false, 'https://randomuser.me/api/portraits/men/75.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Conceicao Maria Pereira', 'F', '1950-12-09', 'Casada',     'Rita Pereira',     '(11) 98888-0005', 'Osteoporose',            'Fisioterapia 3x semana',     '2025-03-05', false, false, 'https://randomuser.me/api/portraits/women/70.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Luiz Carlos Rodrigues',   'M', '1935-07-28', 'Casado',     'Fernanda Costa',   '(11) 98888-0006', 'Parkinson',              'Medicacao controlada',       '2025-03-20', false, false, 'https://randomuser.me/api/portraits/men/80.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Tereza Cristina Alves',   'F', '1948-04-11', 'Divorciada', 'Diego Alves',      '(11) 98888-0007', 'Depressao',              'Acompanhamento psicologico', '2025-04-01', false, false, 'https://randomuser.me/api/portraits/women/75.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Manoel Joaquim Costa',    'M', '1932-09-05', 'Viuvo',      'Joana Costa',      '(11) 98888-0008', 'Diabetes, Renal',        'Dieta hipossodica',          '2025-04-15', true,  false, 'https://randomuser.me/api/portraits/men/65.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Benedita Souza Martins',  'F', '1939-01-30', 'Viuva',      'Roberto Martins',  '(11) 98888-0009', 'Hipertensao',            'Controle diario de pressao', '2025-05-02', false, false, 'https://randomuser.me/api/portraits/women/80.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Francisco Gomes Neto',    'M', '1943-06-18', 'Solteiro',   'Claudia Gomes',    '(11) 98888-0010', 'DPOC',                   'Uso de oxigenio noturno',    '2025-05-20', false, false, 'https://randomuser.me/api/portraits/men/68.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Severino Mendes Cunha',   'M', '1937-10-25', 'Viuvo',      'Lucia Mendes',     '(11) 98888-0011', 'Catarata',               'Cirurgia agendada',          '2025-06-03', false, false, 'https://randomuser.me/api/portraits/men/55.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Helena Batista Cardoso',  'F', '1946-03-12', 'Casada',     'Andre Cardoso',    '(11) 98888-0012', 'Artrose',                'Dificuldade locomocao',      '2025-06-12', false, false, 'https://randomuser.me/api/portraits/women/56.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Geraldo Pinto Ramos',     'M', '1944-12-05', 'Casado',     'Vera Ramos',       '(11) 98888-0013', 'Hipertensao',            'Monitoramento constante',    '2025-06-22', false, false, 'https://randomuser.me/api/portraits/men/41.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Iracema Sousa Vieira',    'F', '1941-09-19', 'Viuva',      'Tiago Vieira',     '(11) 98888-0014', 'Diabetes tipo 2',        'Dieta sem acucar',           '2025-07-04', false, false, 'https://randomuser.me/api/portraits/women/42.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Mauricio Almeida Borges', 'M', '1936-04-08', 'Viuvo',      'Renata Borges',    '(11) 98888-0015', 'AVC previo',             'Reabilitacao motora',        '2025-07-15', false, false, 'https://randomuser.me/api/portraits/men/45.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Lourdes Carvalho Rocha',  'F', '1949-07-23', 'Casada',     'Marcelo Rocha',    '(11) 98888-0016', 'Glaucoma',               'Colirio diario',             '2025-07-28', false, false, 'https://randomuser.me/api/portraits/women/45.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Joaquim Barbosa Lima',    'M', '1933-11-14', 'Casado',     'Sandra Lima',      '(11) 98888-0017', 'Alzheimer moderado',     'Necessita acompanhamento',   '2025-08-05', false, false, 'https://randomuser.me/api/portraits/men/50.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Aparecida Nunes Freitas', 'F', '1947-02-28', 'Divorciada', 'Carla Freitas',    '(11) 98888-0018', 'Fibromialgia',           'Tratamento da dor cronica',  '2025-08-19', false, false, 'https://randomuser.me/api/portraits/women/50.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Raimundo Teixeira Melo',  'M', '1942-06-30', 'Viuvo',      'Bruno Melo',       '(11) 98888-0019', 'Insuficiencia renal',    'Hemodialise 3x semana',      '2025-09-02', false, false, 'https://randomuser.me/api/portraits/men/52.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Vitoria Ribeiro Pacheco', 'F', '1944-05-17', 'Viuva',      'Igor Pacheco',     '(11) 98888-0020', 'Osteopenia',             'Suplementacao de calcio',    '2025-09-14', false, false, 'https://randomuser.me/api/portraits/women/52.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Edgar Antunes Siqueira',  'M', '1939-08-04', 'Solteiro',   'Patricia Antunes', '(11) 98888-0021', 'Asma',                   'Bombinha de resgate',        '2025-09-25', false, false, 'https://randomuser.me/api/portraits/men/58.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Cecilia Moreira Tavares', 'F', '1950-10-11', 'Casada',     'Hugo Tavares',     '(11) 98888-0022', 'Anemia',                 'Acompanhamento mensal',      '2025-10-06', false, false, 'https://randomuser.me/api/portraits/women/58.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Otavio Cunha Marinho',    'M', '1945-01-22', 'Casado',     'Sofia Marinho',    '(11) 98888-0023', 'Hernia de disco',        'Fisioterapia regular',       '2025-10-18', false, false, 'https://randomuser.me/api/portraits/men/61.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Marlene Dias Camargo',    'F', '1938-12-07', 'Viuva',      'Ricardo Camargo',  '(11) 98888-0024', 'Hipertireoidismo',       'Controle hormonal',          '2025-10-30', false, false, 'https://randomuser.me/api/portraits/women/61.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Bento Araujo Cavalcante', 'M', '1940-04-26', 'Viuvo',      'Marina Cavalcante','(11) 98888-0025', 'Arritmia cardiaca',      'Marcapasso implantado',      '2025-11-08', false, false, 'https://randomuser.me/api/portraits/men/63.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Sonia Castro Bezerra',    'F', '1943-03-09', 'Divorciada', 'Felipe Bezerra',   '(11) 98888-0026', 'Depressao maior',        'Psicoterapia semanal',       '2025-11-20', true,  false, 'https://randomuser.me/api/portraits/women/63.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Domingos Pires Andrade',  'M', '1934-07-15', 'Viuvo',      'Helena Andrade',   '(11) 98888-0027', 'Demencia vascular',      'Cuidados continuos',         '2025-12-02', false, false, 'https://randomuser.me/api/portraits/men/66.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Cleusa Silveira Goncalves','F','1946-11-29', 'Casada',     'Daniel Goncalves', '(11) 98888-0028', 'Colesterol alto',        'Estatinas e dieta',          '2025-12-15', false, false, 'https://randomuser.me/api/portraits/women/66.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Hildebrando Macedo Silva','M', '1932-05-03', 'Viuvo',      'Beatriz Macedo',   '(11) 98888-0029', 'Cancer de prostata',     'Tratamento oncologico',      '2026-01-10', false, true,  'https://randomuser.me/api/portraits/men/74.jpg');

INSERT INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido, foto_url)
VALUES ('Edna Coutinho Magalhaes', 'F', '1942-08-21', 'Solteira',   'Vinicius Magalhaes','(11) 98888-0030', 'Bronquite cronica',     'Inalacao 2x dia',            '2026-01-25', false, false, 'https://randomuser.me/api/portraits/women/74.jpg');

-- Cardapio semanal
-- tipo: 'cafe' | 'almoco' | 'jantar'  (lowercase — padrao do frontend)
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Segunda', 'cafe',   'Pão integral com queijo e café com leite', 220);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Segunda', 'almoco', 'Frango grelhado com arroz e salada',       450);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Segunda', 'jantar', 'Sopa de legumes com pão',                  280);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Terca',   'cafe',   'Mingau de aveia com banana',               200);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Terca',   'almoco', 'Carne assada com purê e feijão',           520);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Terca',   'jantar', 'Vitamina de banana com torrada',           250);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quarta',  'cafe',   'Iogurte natural com granola e mel',        180);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quarta',  'almoco', 'Peixe cozido com arroz e brócolis',        380);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quarta',  'jantar', 'Caldo de legumes com macarrão',            230);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quinta',  'cafe',   'Tapioca com queijo e suco de laranja',     210);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quinta',  'almoco', 'Frango ensopado com macarrão',             490);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quinta',  'jantar', 'Caldo de feijão com pão',                  310);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sexta',   'cafe',   'Vitamina de mamão com biscoito integral',  190);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sexta',   'almoco', 'Bife acebolado com arroz e salada',        510);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sexta',   'jantar', 'Sopa creme de abóbora',                    260);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sabado',  'cafe',   'Pão de queijo com café e fruta',           230);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sabado',  'almoco', 'Feijoada light com arroz e couve',         480);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sabado',  'jantar', 'Iogurte com granola e fruta',              200);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Domingo', 'cafe',   'Bolo simples com leite e fruta',           240);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Domingo', 'almoco', 'Frango assado com batata e salada',        530);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Domingo', 'jantar', 'Sanduíche natural com suco',               290);

-- Medicamentos (RF10)
INSERT INTO medicamentos (idoso_id, nome, dosagem, horarios, frequencia, observacoes, ativo, data_cadastro)
VALUES (1, 'Losartana',      '50mg',   '08:00, 20:00', '12/12h',   'Controle de hipertensao',  true, '2025-01-12');
INSERT INTO medicamentos (idoso_id, nome, dosagem, horarios, frequencia, observacoes, ativo, data_cadastro)
VALUES (1, 'Metformina',     '850mg',  '08:00, 12:00, 20:00', '8/8h', 'Controle de glicemia', true, '2025-01-12');
INSERT INTO medicamentos (idoso_id, nome, dosagem, horarios, frequencia, observacoes, ativo, data_cadastro)
VALUES (2, 'Ibuprofeno',     '400mg',  '12:00', 'Diario', 'Dor articular',                    true, '2025-01-20');
INSERT INTO medicamentos (idoso_id, nome, dosagem, horarios, frequencia, observacoes, ativo, data_cadastro)
VALUES (3, 'Donepezila',     '10mg',   '22:00', 'Diario noturno', 'Para Alzheimer',           true, '2025-02-05');
INSERT INTO medicamentos (idoso_id, nome, dosagem, horarios, frequencia, observacoes, ativo, data_cadastro)
VALUES (4, 'Furosemida',     '40mg',   '08:00', 'Diario', 'Diuretico - cardiaco',             true, '2025-02-12');
INSERT INTO medicamentos (idoso_id, nome, dosagem, horarios, frequencia, observacoes, ativo, data_cadastro)
VALUES (6, 'Levodopa',       '250mg',  '06:00, 14:00, 22:00', '8/8h', 'Parkinson',            true, '2025-03-22');

-- Registros de saude (RF11)
INSERT INTO registros_saude (idoso_id, data, peso, pressao_sistolica, pressao_diastolica, temperatura, glicemia, observacoes)
VALUES (1, '2026-01-15', 68.5, 130, 85, 36.5, 110, 'Estavel');
INSERT INTO registros_saude (idoso_id, data, peso, pressao_sistolica, pressao_diastolica, temperatura, glicemia, observacoes)
VALUES (1, '2026-02-18', 69.0, 125, 80, 36.4, 105, 'Melhora no controle glicemico');
INSERT INTO registros_saude (idoso_id, data, peso, pressao_sistolica, pressao_diastolica, temperatura, glicemia, observacoes)
VALUES (1, '2026-03-19', 68.2, 128, 82, 36.6, 108, '');
INSERT INTO registros_saude (idoso_id, data, peso, pressao_sistolica, pressao_diastolica, temperatura, glicemia, observacoes)
VALUES (1, '2026-04-20', 67.8, 122, 78, 36.5, 102, 'Bom progresso');
INSERT INTO registros_saude (idoso_id, data, peso, pressao_sistolica, pressao_diastolica, temperatura, glicemia, observacoes)
VALUES (2, '2026-04-10', 75.0, 140, 90, 36.7, 95, 'Pressao um pouco alta');
INSERT INTO registros_saude (idoso_id, data, peso, pressao_sistolica, pressao_diastolica, temperatura, glicemia, observacoes)
VALUES (3, '2026-04-05', 62.4, 120, 75, 36.3, 90, '');

-- Atividades (RF06 / RF12) — entradas iniciais para aparecerem no seletor
INSERT INTO atividade (nome, data_registro, hora_registro) VALUES ('Fisioterapia',  '2026-01-01', '09:00:00');
INSERT INTO atividade (nome, data_registro, hora_registro) VALUES ('Artesanato',    '2026-01-01', '14:00:00');
INSERT INTO atividade (nome, data_registro, hora_registro) VALUES ('Musicoterapia', '2026-01-01', '16:00:00');

-- Visitas (RF13)
INSERT INTO visitas (idoso_id, data_visita, nome_visitante, parentesco, observacoes)
VALUES (1, '2026-04-18', 'Carlos Silva',    'Filho',      'Trouxe fotos da familia');
INSERT INTO visitas (idoso_id, data_visita, nome_visitante, parentesco, observacoes)
VALUES (1, '2026-03-22', 'Paula Silva',     'Neta',       'Visita curta, bem-humorada');
INSERT INTO visitas (idoso_id, data_visita, nome_visitante, parentesco, observacoes)
VALUES (2, '2026-04-15', 'Ana Santos',      'Filha',      'Conversou bastante');
INSERT INTO visitas (idoso_id, data_visita, nome_visitante, parentesco, observacoes)
VALUES (3, '2026-02-10', 'Paulo Oliveira',  'Sobrinho',   'Levou para passeio no jardim');
INSERT INTO visitas (idoso_id, data_visita, nome_visitante, parentesco, observacoes)
VALUES (5, '2026-04-20', 'Rita Pereira',    'Filha',      'Conversa animada');
