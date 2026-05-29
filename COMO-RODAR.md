# Como Rodar o AssisConnect

---

## ⚡ Como Startar o Projeto (TL;DR)

### 1. Backend (pasta `backend/`)

**Opção A — Maven portable do projeto (qualquer PC, zero instalação):**
```powershell
.\tools\maven\bin\mvn.cmd spring-boot:run
```

**Opção B — Maven instalado no PATH:**
```powershell
mvn spring-boot:run
```

Verifica se tem Maven global: `mvn -v`
- Se aparecer versão → tá no PATH, pode usar opção B
- Se der erro → usa opção A (portable)

Sobe em `http://localhost:8080`.

### 2. Frontend (pasta `frontend/`, outro terminal)

```bash
npx expo start
```

Escaneia QR no **Expo Go**.

### 3. Atalho — `.bat` na raiz

Cria `start-back.bat`:
```bat
cd backend
tools\maven\bin\mvn.cmd spring-boot:run
```
Dois cliques sobe o back em qualquer PC.

### Adicionar Maven ao PATH (opcional, permanente)

1. Win+R → `sysdm.cpl` → Avançado → Variáveis de Ambiente
2. Em "Path" → Novo → `C:\maven\bin` (ou caminho do portable)
3. Reabre terminal → `mvn -v` confere

---

## Pré-requisitos

- Java JDK 17+ instalado → https://adoptium.net
- Node.js 18+ instalado → https://nodejs.org
- App **Expo Go** no celular (Play Store / App Store)

---

## Definir JAVA_HOME (toda vez que abrir o terminal)

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot"
```

---

## Modo H2 — sala de aula (sem instalar MySQL)

Abra um terminal na pasta `backend/`:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot"
& ".\tools\maven\bin\mvn.cmd" spring-boot:run
```

- Backend sobe em: `http://localhost:8080`
- Painel do banco H2: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:assisconnect`
  - Usuário: `sa` | Senha: *(vazio)*
- Dados de teste carregados automaticamente (seed automático)

---

## Modo MySQL — entrega final

1. Certifique-se que o MySQL está rodando com:
   - Banco: `assisconnect`
   - Usuário: `root` | Senha: `root`

2. Rode o script de seed uma vez:
   ```
   backend/sql/seed-mysql.sql
   ```

3. Inicie o backend com o perfil MySQL:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot"
& ".\tools\maven\bin\mvn.cmd" spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

---

## Frontend (React Native)

Abra **outro terminal** na pasta `frontend/`:

```bash
npx expo start
```

- Escaneie o QR code com o **Expo Go** no celular
- Ou pressione `w` para abrir no navegador

### Celular via Expo Go — IP da máquina

No celular, `localhost` aponta pro próprio celular. Precisa usar o IP real do PC:

1. Descubra o IP: rode `ipconfig` no Windows → pegue o **Endereço IPv4** do Wi-Fi
2. Edite `frontend/src/api.js` e troque o IP na linha do celular:
   ```js
   : 'http://SEU_IP:8080'; // celular → IP do PC na rede
   ```

**IP atual (rede 10.0.0.x):** `10.0.0.222`

> Se trocar de rede (ex: faculdade), o IP muda. Repita o `ipconfig` e atualize o arquivo.

---

## Login padrão

| Campo | Valor |
|-------|-------|
| Email | pedrocauaggn@gmail.com |
| Senha | pedro123 |
