# (EN-US)
# **AssisConnect Mobile**

A direct continuation of **AssisConnect Web**, now focused on **mobile** (with a web preview).
A full-stack project where the Java backend exposes a REST API and the React Native (Expo) frontend consumes that API.

This project was adapted for an **academic environment (university)**, where installing software or changing system environment variables is not allowed.

---

## **🛠 Technologies Used**

### Backend
- Java 17+
- MySQL
- Maven (alternative / local mode)

### Frontend
- React Native
- Expo
- Expo Go (running on the phone)
- React Native Web (browser preview)
- Fetch API

---

## **Maven (alternative mode – university environment)**

### The problem
On university computers:
- Installing Maven is not allowed
- Changing the PATH or system environment variables is not allowed

Because of that, **the traditional `mvn` command cannot be used**.

---

### The solution adopted in this project
This project uses an **alternative way of running Maven**, allowing the backend to run **without installing Maven on the system**.

Maven runs locally from the project itself, ensuring that:
- The backend works on any computer
- No system configuration is required
- The project runs normally in an academic environment

---

## **How to run the project**

## Backend (API)

### 1) Go to the backend folder
In the terminal, from the project root:

  cd backend

### 2) Run the backend (alternative mode – WITHOUT Maven installed)
Use the command below:

  .\mvnw spring-boot:run

This command:
- Automatically downloads everything the project needs
- Compiles the backend
- Starts the API

No additional installation is required.

---

### 3) API running
Once started, the API will be available at:
- http://localhost:8080

---

## Frontend (Expo)

### 1) Go to the frontend folder
In the terminal, from the project root:

  cd frontend

### 2) Install dependencies
  npm install

### 3) Run the web preview
  npx expo start --web --port 8081

Open it in the browser:
- http://localhost:8081

---

## Running on the phone (Expo Go)

### 1) Start Expo
  npx expo start --port 8081

### 2) On the phone
- Install the **Expo Go** app
- Connect the phone to the same network as the computer
- Scan the QR Code shown in the terminal

The app will load directly on the phone.

---

## **Important Note**
This method was chosen specifically for the **university environment**, ensuring the project runs without admin permissions, external installations, or changes to the operating system.

---

# (PT-BR)
# **AssisConnect Mobile**

Continuação direta do **AssisConnect Web**, agora voltado para **mobile** (com preview web).
Projeto fullstack onde o backend em Java expõe uma API REST e o frontend em React Native (Expo) consome essa API.

Este projeto foi adaptado para **ambiente acadêmico (faculdade)**, onde não é possível instalar softwares nem alterar variáveis de ambiente do sistema.

---

## **🛠 Tecnologias Utilizadas**

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

## **Maven (modo alternativo – ambiente de faculdade)**

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

## **Como rodar o projeto**

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

## **Observação Importante**
Este método foi escolhido especificamente para **ambiente de faculdade**, garantindo que o projeto rode sem permissões administrativas, instalações externas ou alterações no sistema operacional.
