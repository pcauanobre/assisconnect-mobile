# AssisConnect Mobile

Continuação direta do **AssisConnect Web**, agora voltado para **mobile** (com preview web).
Projeto fullstack onde o backend em Java expõe uma API REST e o frontend em React Native (Expo) consome essa API.

Este projeto foi adaptado para **ambiente acadêmico (faculdade)**, onde não é possível instalar softwares nem alterar variáveis de ambiente do sistema.

---

## Tecnologias Utilizadas

### Backend
- Java 17+
- MySQL
- Maven (modo alternativo / local)

### Frontend
- React Native
- Expo
- Expo Go (execução no celular)
- React Native Web (preview no navegador)
- Fetch API

---

## Maven (modo alternativo – ambiente de faculdade)

### O problema
Em computadores de faculdade:
- Não é permitido instalar o Maven
- Não é permitido alterar o PATH ou variáveis de ambiente

Por isso, **não é possível usar o comando `mvn` tradicional**.

---

### A solução adotada neste projeto
Este projeto utiliza uma **forma alternativa de execução do Maven**, permitindo rodar o backend **sem instalar Maven no sistema**.

O Maven é executado localmente a partir do próprio projeto, garantindo que:
- O backend funcione em qualquer computador
- Nenhuma configuração de sistema seja necessária
- O projeto rode normalmente em ambiente acadêmico

---

## Como rodar o projeto

## Backend (API)

### 1) Acessar a pasta do backend
No terminal, a partir da raiz do projeto:

  cd backend

### 2) Rodar o backend (modo alternativo – SEM Maven instalado)
Use o comando abaixo:

  .\mvnw spring-boot:run

Esse comando:
- Baixa automaticamente tudo que o projeto precisa
- Compila o backend
- Inicia a API

Nenhuma instalação adicional é necessária.

---

### 3) API em execução
Após iniciar, a API estará disponível em:
- http://localhost:8080

---

## Frontend (Expo)

### 1) Acessar a pasta do frontend
No terminal, a partir da raiz do projeto:

  cd frontend

### 2) Instalar dependências
  npm install

### 3) Rodar preview web
  npx expo start --web --port 8081

Acesse no navegador:
- http://localhost:8081

---

## Rodar no celular (Expo Go)

### 1) Iniciar o Expo
  npx expo start --port 8081

### 2) No celular
- Instale o aplicativo **Expo Go**
- Conecte o celular na mesma rede do computador
- Escaneie o QR Code exibido no terminal

O aplicativo será carregado diretamente no celular.

---

## Observação Importante
Este método foi escolhido especificamente para **ambiente de faculdade**, garantindo que o projeto rode sem permissões administrativas, instalações externas ou alterações no sistema operacional.
