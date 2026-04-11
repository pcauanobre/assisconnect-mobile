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
