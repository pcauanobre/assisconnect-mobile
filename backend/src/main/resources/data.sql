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

-- Cardapio semanal
-- tipo: 'cafe' | 'almoco' | 'jantar'  (lowercase — padrao do frontend)
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Segunda', 'cafe',   'Pao integral com queijo e cafe com leite', 220);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Segunda', 'almoco', 'Frango grelhado com arroz e salada',       450);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Segunda', 'jantar', 'Sopa de legumes com pao',                  280);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Terca',   'cafe',   'Mingau de aveia com banana',               200);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Terca',   'almoco', 'Carne assada com pure e feijao',           520);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Terca',   'jantar', 'Vitamina de banana com torrada',           250);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quarta',  'cafe',   'Iogurte natural com granola e mel',        180);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quarta',  'almoco', 'Peixe cozido com arroz e brocolis',        380);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quarta',  'jantar', 'Caldo de legumes com macarrao',            230);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quinta',  'cafe',   'Tapioca com queijo e suco de laranja',     210);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quinta',  'almoco', 'Frango ensopado com macarrao',             490);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quinta',  'jantar', 'Caldo de feijao com pao',                  310);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sexta',   'cafe',   'Vitamina de mamao com biscoito integral',  190);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sexta',   'almoco', 'Bife acebolado com arroz e salada',        510);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sexta',   'jantar', 'Sopa creme de abobora',                    260);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sabado',  'cafe',   'Pao de queijo com cafe e fruta',           230);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sabado',  'almoco', 'Feijoada light com arroz e couve',         480);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sabado',  'jantar', 'Iogurte com granola e fruta',              200);

INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Domingo', 'cafe',   'Bolo simples com leite e fruta',           240);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Domingo', 'almoco', 'Frango assado com batata e salada',        530);
INSERT INTO cardapio (dia, tipo, prato, calorias) VALUES ('Domingo', 'jantar', 'Sanduiche natural com suco',               290);

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
