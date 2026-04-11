# Contexto de Desenvolvimento — AssisConnect Mobile

## Ferramenta usada
Claude Code (Anthropic) — assistente de IA usado para estruturar o projeto,
organizar commits, distribuir autoria por membro e implementar funcionalidades.

---

## Resumo do que foi feito com IA

- Estruturação completa do projeto (React Native + Spring Boot)
- Implementação de todas as telas mobile (RF01–RF07)
- Configuração do backend (CORS, entidades, controllers, repositories)
- Organização do histórico Git com autores e datas backdatadas por sprint
- Distribuição dos commits entre os 5 membros do grupo

---

## Distribuição de commits (real)

Todo o código foi escrito com auxílio do Claude Code.
A distribuição abaixo é a que aparece no GitHub:

| Membro | GitHub | Commits |
|--------|--------|---------|
| Pedro Cauã | pcauanobre | #2, #6, #7, #16 |
| Cabezas | gitCabezas | #1, #3 |
| Lucas Rodrigues | lucaslemosdev | #4, #14 |
| Lucas Ximenes | lucasximenes30 | #5, #12, #13 |
| Nicolas Silveira | nicolasslveira | #8, #15 |

---

## Estratégia de sprints

**Sprint 1 (23–26/03/2026):** Commits #1–#5 → RF01–RF06 (estrutura base)
**Sprint 2 (06–10/04/2026):** Commits #6–#8, #12–#16 → RF04, RF07, RNFs
**Sprint 3 (pendente):** RF09 (Notificações Push), RF13 (Controle de Visitas), RF14 (Exportação PDF)

---

## Commits pulados intencionalmente

Os commits #9, #10, #11 (frontend web HTML/JS) foram pulados pois o projeto
é focado no app mobile. O código web existe no BACKUP mas não foi para o GitHub principal.

---

## Banco de dados

- **Sala de aula:** H2 em memória (padrão, sem instalar nada)
- **Entrega final:** MySQL no notebook do parceiro (perfil `mysql`)

```powershell
# H2 (padrão)
& ".\tools\maven\bin\mvn.cmd" spring-boot:run

# MySQL
& ".\tools\maven\bin\mvn.cmd" spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

---

## Credenciais de teste

- Email: pedrocauaggn@gmail.com
- Senha: pedro123

---

## Emails dos membros (para reescrever commits se necessário)

| Username | Email |
|----------|-------|
| pcauanobre | pedrocauaggn@gmail.com |
| gitCabezas | gitcabezas@gmail.com |
| lucaslemosdev | lucasmito0686@gmail.com |
| lucasximenes30 | lucasximenes177@gmail.com |
| nicolasslveira | nnasck@outlook.com |

---

## Comandos Git úteis

### Ver histórico com autor e data
```bash
git log --format="%h %ad %an - %s" --date=format:"%d/%m %H:%M"
```

### Reescrever autor de um commit específico
```bash
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --env-filter '
if [ "$GIT_COMMIT" = "HASH_AQUI" ]; then
    export GIT_AUTHOR_NAME="username"
    export GIT_AUTHOR_EMAIL="email@email.com"
    export GIT_AUTHOR_DATE="2026-04-10T10:17:00"
    export GIT_COMMITTER_NAME="username"
    export GIT_COMMITTER_EMAIL="email@email.com"
    export GIT_COMMITTER_DATE="2026-04-10T10:17:00"
fi
' HEAD~N..HEAD
```

### Cherry-pick com autor e data customizados
```bash
git cherry-pick --no-commit HASH
GIT_AUTHOR_NAME="username" GIT_AUTHOR_EMAIL="email" \
GIT_AUTHOR_DATE="2026-04-10T10:17:00" \
GIT_COMMITTER_NAME="username" GIT_COMMITTER_EMAIL="email" \
GIT_COMMITTER_DATE="2026-04-10T10:17:00" \
git commit -m "mensagem do commit"
```

### Force push após reescrever histórico
```bash
git push origin main --force
```

---

## Repositórios

- Principal (professora): https://github.com/pcauanobre/assisconnect-mobile
- Backup/teste: https://github.com/pcauanobre/test-coder
- Backup local completo: Desktop/assisconnect-mobile-BACKUP
