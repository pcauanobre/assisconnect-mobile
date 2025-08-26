# 📱 AssisConnect – Aplicativo Mobile para Responsáveis

O **AssisConnect Mobile** é a versão do sistema pensada para **familiares/responsáveis** dos idosos cadastrados, com acesso a medicações, histórico e relatórios.  
A versão **web** é usada pelos administradores da instituição (gestão geral).

---

## 🎯 Objetivo

- Fornecer visão individual do idoso ao responsável.  
- Centralizar medicações, histórico clínico e relatórios.  
- Garantir informação organizada e segura.  

---

## 📦 Funcionalidades (em desenvolvimento)

- Login do responsável (acesso apenas ao seu idoso).  
- **Dashboard**: medicações do dia, consultas, atividades.  
- Histórico de saúde: alergias, condições, anotações.  
- Notificações/alertas (medicação/eventos).  
- Relatórios periódicos da instituição.  

---

## 🛠 Tecnologias

- **React Native (Expo)** → app mobile + web  
- **JavaScript** → lógica da aplicação  
- **Node.js + npm** → dependências  
- **Git/GitHub** → versionamento/colaboração  

---

## 🚀 Guia de Uso

### Passo a passo no terminal

```bash
# 0) Configurar identidade do Git (uma vez no PC)
git config --global user.name  "Seu Nome"
git config --global user.email "seuemail@exemplo.com"
git config --global --list


# 1) Clonar o repositório e entrar na pasta
git clone https://github.com/pcauanobre/assisconnect-mobile.git
cd assisconnect-mobile


# 2) Instalar dependências do projeto
npm install
npx expo install react-dom react-native-web @expo/metro-runtime


# 3) Rodar o projeto
# Web (navegador) – por padrão em http://localhost:8081
npx expo start --web

# OU: Expo Go (Android/iOS) – mostra QR Code no terminal
npx expo start


# 4) Fluxo diário de Git (antes, durante e depois de editar)
# (Antes de começar) Atualizar sua cópia local
git pull origin main

# (Após editar) Conferir o que mudou
git status

# Preparar TODAS as mudanças para commit
git add -A

# Criar o commit (mensagem clara do que foi feito)
git commit -m "feat: descrição breve do que foi implementado"

# Enviar para o GitHub (branch atual, geralmente 'main')
git push
