-- ============================================================
--  SEED MySQL — executar UMA VEZ após subir o backend
--  (o backend cria as tabelas automaticamente com ddl-auto=update)
-- ============================================================

USE assisconnect;

-- Usuário admin
INSERT IGNORE INTO usuario (usuario, senha, email, nome, telefone, administrador)
VALUES ('pedro', 'pedro123', 'pedrocauaggn@gmail.com', 'Pedro Caua', '(11) 99999-0001', true);

-- Idosos
INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Maria Aparecida Silva',    'F', '1942-05-14', 'Viuva',    'Carlos Silva',    '(11) 98888-0001', 'Hipertensao, Diabetes',   'Necessita dieta especial',  '2025-01-10', false, false);

INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Jose Benedito Santos',     'M', '1938-11-03', 'Casado',   'Ana Santos',      '(11) 98888-0002', 'Artrite',                 'Usa andador',               '2025-01-15', false, false);

INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Rosa de Fatima Oliveira',  'F', '1945-08-22', 'Solteira', 'Paulo Oliveira',  '(11) 98888-0003', 'Alzheimer leve',          'Acompanhamento semanal',    '2025-02-01', false, false);

INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Antonio Ferreira Lima',    'M', '1940-02-17', 'Viuvo',    'Marcos Lima',     '(11) 98888-0004', 'Insuficiencia cardiaca',  'Repouso apos procedimento', '2025-02-10', false, false);

INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Conceicao Maria Pereira',  'F', '1950-12-09', 'Casada',   'Rita Pereira',    '(11) 98888-0005', 'Osteoporose',             'Fisioterapia 3x semana',    '2025-03-05', false, false);

INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Luiz Carlos Rodrigues',    'M', '1935-07-28', 'Casado',   'Fernanda Costa',  '(11) 98888-0006', 'Parkinson',               'Medicacao controlada',      '2025-03-20', false, false);

INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Tereza Cristina Alves',    'F', '1948-04-11', 'Divorciada','Diego Alves',    '(11) 98888-0007', 'Depressao',               'Acompanhamento psicologico', '2025-04-01', false, false);

INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Manoel Joaquim Costa',     'M', '1932-09-05', 'Viuvo',    'Joana Costa',     '(11) 98888-0008', 'Diabetes, Renal',         'Dieta hipossodica',         '2025-04-15', true,  false);

INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Benedita Souza Martins',   'F', '1939-01-30', 'Viuva',    'Roberto Martins', '(11) 98888-0009', 'Hipertensao',             'Controle diario de pressao','2025-05-02', false, false);

INSERT IGNORE INTO idosos (nome, sexo, data_nascimento, estado_civil, responsavel, telefone_responsavel, doencas, observacoes, data_criacao, inativo, falecido)
VALUES ('Francisco Gomes Neto',     'M', '1943-06-18', 'Solteiro', 'Claudia Gomes',   '(11) 98888-0010', 'DPOC',                    'Uso de oxigenio noturno',   '2025-05-20', false, false);

-- Cardapio semanal
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Segunda', 'Almoco', 'Frango grelhado com arroz e salada', 450);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Segunda', 'Jantar', 'Sopa de legumes com pao', 280);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Terca',   'Almoco', 'Carne assada com pure e feijao', 520);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Terca',   'Jantar', 'Vitamina de banana com torrada', 250);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quarta',  'Almoco', 'Peixe cozido com arroz e brocolis', 380);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quarta',  'Jantar', 'Mingau de aveia com fruta', 220);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quinta',  'Almoco', 'Frango ensopado com macarrao', 490);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Quinta',  'Jantar', 'Caldo de feijao com pao', 310);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sexta',   'Almoco', 'Bife acebolado com arroz e salada', 510);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sexta',   'Jantar', 'Sopa creme de abobora', 260);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sabado',  'Almoco', 'Feijoada light com arroz e couve', 480);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Sabado',  'Jantar', 'Iogurte com granola e fruta', 200);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Domingo', 'Almoco', 'Frango assado com batata e salada', 530);
INSERT IGNORE INTO cardapio (dia, tipo, prato, calorias) VALUES ('Domingo', 'Jantar', 'Sanduiche natural com suco', 290);
