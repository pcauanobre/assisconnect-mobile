# AssisConnect Mobile — Guia do Desenvolvedor

## O que é

Sistema de gestão para lares de idosos. Possui:
- App mobile (React Native / Expo)
- Backend REST (Spring Boot / Java)
- Banco de dados MySQL

---

## Pré-requisitos

| Ferramenta | Versão | Link |
|------------|--------|------|
| Java (JDK) | 17+ | https://adoptium.net |
| MySQL | 8.0+ | https://dev.mysql.com/downloads |
| Node.js | 18+ | https://nodejs.org |
| Expo Go (celular) | — | App Store / Play Store |

---

## Configuração inicial

### 1. Banco de dados

Crie o banco no MySQL:

```sql
CREATE DATABASE assisconnect;
```

Credenciais padrão configuradas no backend:
- Host: `localhost:3306`
- Banco: `assisconnect`
- Usuário: `root`
- Senha: `root`

> Para alterar, edite `backend/src/main/resources/application.properties`

---

## Como iniciar

### Backend (Spring Boot)

Abra um terminal na pasta `backend/`:

```powershell
# Windows (caminho com espaço no nome — usar o Maven embutido)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot"
& ".\tools\maven\bin\mvn.cmd" spring-boot:run
```

O backend sobe em: `http://localhost:8080`

> O JDK precisa estar instalado e o JAVA_HOME definido na sessão.
> Se der erro de JAVA_HOME, rode a linha `$env:JAVA_HOME = ...` antes de rodar o Maven.

### Frontend (React Native / Expo)

Abra **outro** terminal na pasta `frontend/`:

```bash
npx expo start
```

- **Celular:** escaneie o QR code com o app **Expo Go**
- **Web:** pressione `w` no terminal
- **Emulador Android:** pressione `a` (requer Android Studio)

---

## Login

O sistema não tem usuário padrão. Crie uma conta via endpoint ou pela tela de cadastro do app.

**Conta de teste criada:**
- Email: `pedrocauaggn@gmail.com`
- Senha: `pedro123`

Para criar outro usuário via API:

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"usuario":"seunome","nome":"Seu Nome","email":"seu@email.com","senha":"suasenha"}'
```

---

## Erros comuns e soluções

### `JAVA_HOME is not defined correctly`
O Maven não encontrou o Java. Solução:
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot"
```
Execute esse comando **antes** do `mvn.cmd`.

### `mvnw.cmd` falha com caminho com espaço (`Pedro Cauã`)
O wrapper padrão quebra com espaços/acentos no caminho. Use o Maven embutido:
```powershell
& ".\tools\maven\bin\mvn.cmd" spring-boot:run
```

### Backend sobe mas API retorna 404
Verifique se está usando o caminho correto. Os endpoints são:
- `POST /auth/register` — cadastro
- `POST /auth/login` — login
- `GET /idosos` — lista de idosos
- etc.

Não usar `/api/` no prefixo — os controllers não têm esse mapeamento.

### Frontend não conecta ao backend
O app aponta para `localhost:8080`. No celular físico via Expo Go, `localhost` é o próprio celular. Substitua pelo IP da máquina na rede local:
1. Descubra o IP: `ipconfig` no Windows
2. Edite os arquivos de service em `frontend/src/services/` trocando `localhost` pelo IP

### Banco não conecta (`Communications link failure`)
- Verifique se o MySQL está rodando
- Verifique usuário/senha em `application.properties`
- Certifique que o banco `assisconnect` existe

---

## Onde estamos (status do projeto)

### Funcionalidades implementadas

| Requisito | Descrição | Status |
|-----------|-----------|--------|
| RF01 | Estrutura base + navegação | Feito |
| RF02 | Autenticação (login, cadastro, recuperar senha) | Feito |
| RF03 | Dashboard + perfil do usuário | Feito |
| RF04 | CRUD completo de idosos | Feito |
| RF05 | Cardápio semanal | Feito |
| RF06 | Registro diário de presença | Feito |
| RF07 | Relatórios mensais com estatísticas | Feito |
| RF08 | Interface web (Spring Boot + Thymeleaf) | Feito |
| RNF01 | Headers padronizados + swipe entre abas | Feito |
| RNF02 | Funções utilitárias compartilhadas | Feito |
| RNF03 | Configuração CORS | Feito |
| RNF04 | Gitignore configurado | Feito |
| RNF05 | Tema e estilos globais | Feito |

### Estrutura do repositório

```
assisconnect-mobile/
├── backend/          # Spring Boot — API REST (porta 8080)
├── frontend/         # React Native / Expo — app mobile
└── front-end web/    # Interface web estática (ignorada no git)
```

---

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastrar usuário |
| POST | `/auth/login` | Login |
| GET | `/idosos` | Listar idosos |
| POST | `/idosos` | Cadastrar idoso |
| GET | `/cardapio` | Cardápio semanal |
| GET | `/presenca` | Registros de presença |
| GET | `/relatorios-mensais` | Relatórios mensais |
| GET | `/relatorios-mensais/estatisticas/{mes}/{ano}` | Estatísticas do mês |

---

## Repositório

- Principal: https://github.com/pcauanobre/assisconnect-mobile
- Teste/backup: https://github.com/pcauanobre/test-coder
