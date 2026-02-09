# AssisConnect Mobile

Continuação direta do **AssisConnect Web**, agora voltado para **mobile** (com preview web).
Projeto fullstack onde o backend em Java expõe uma API REST e o frontend em React Native (Expo) consome essa API.

---

## Tecnologias Utilizadas

### Backend
- Java 17+
- MySQL
- Maven

### Frontend
- React Native
- Expo
- Expo Go (execução no celular)
- React Native Web (preview no navegador)
- Fetch API

---

## Maven (o que é e por que precisa)

### 1) O que é o Maven
O Maven é o **gerenciador de build do Java**, equivalente ao npm no mundo JavaScript.

Ele é responsável por:
- Baixar dependências do projeto
- Compilar o código Java
- Executar o backend

Sem o Maven instalado e configurado corretamente, o backend **não roda**.

---

## Instalação do Maven (Windows)

### 1) Baixar e extrair
- Acesse: https://maven.apache.org/download.cgi
- Baixe a versão ZIP do Maven
- Extraia o conteúdo para a pasta (padrão recomendado):
  - C:\maven

Após extrair, confirme que existe o arquivo:
- C:\maven\bin\mvn.cmd

---

### 2) Adicionar o Maven no PATH (obrigatório)
- Abra: Painel de Controle
- Sistema
- Configurações avançadas do sistema
- Variáveis de Ambiente
- Em "Variáveis do sistema", selecione "Path"
- Clique em Editar -> Novo
- Adicione:
  - C:\maven\bin

Salve tudo, feche as janelas e **reabra o terminal**.

---

### 3) Testar o Maven
Abra o PowerShell ou CMD e execute:

  mvn -v

Se aparecer a versão do Maven, a instalação está correta.

---

## Como rodar o projeto

### Backend (API)

#### 1) Acessar a pasta do backend
No terminal, na raiz do projeto:

  cd backend

#### 2) Executar o backend
  mvn spring-boot:run

#### 3) API em execução
A API ficará disponível em:
- http://localhost:8080

---

### Frontend (Expo)

#### 1) Acessar a pasta do frontend
No terminal, a partir da raiz do projeto:

  cd frontend

#### 2) Instalar dependências
  npm install

#### 3) Rodar preview web
  npx expo start --web --port 8081

Acesse no navegador:
- http://localhost:8081

---

### Rodar no celular (Expo Go)

#### 1) Iniciar o Expo
  npx expo start --port 8081

#### 2) No celular
- Instale o app **Expo Go**
- Abra o Expo Go
- Escaneie o QR Code exibido no terminal

---
