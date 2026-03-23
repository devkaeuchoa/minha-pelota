## Minha Pelota

Aplicação web para organizar **peladas e grupos de futebol amador**, substituindo a combinação WhatsApp + planilhas. O foco do MVP é dar ao admin um lugar único para gerenciar grupos, jogadores, datas das partidas e pagamentos básicos.

### Visão

> Centralizar a gestão de grupos de futebol amador — jogadores, datas, presença e pagamentos — em um fluxo simples para admins e jogadores.

### Stack

- **Backend**: PHP 8.2 + Laravel 11
- **Frontend**: React + Inertia.js (SPA via Laravel) com **TypeScript**
- **Estilos**: Tailwind CSS com classes semânticas em BEM (`.page`, `.section`, `.form__group`, etc.)
- **Autenticação**: Laravel Breeze (Inertia + React)
- **Ferramentas de qualidade**:
  - ESLint (flat config v9) + `@typescript-eslint` + `eslint-plugin-react` + Prettier
  - Scripts: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run typecheck`

### Domínio atual (v0.2.0)

#### Grupos

- `Group` com atributos principais:
  - `name`, `slug` (gerado automaticamente a partir do nome, normalizado e em kebab-case)
  - `weekday` (0–6, alinhado ao `Date.getDay()` do JS)
  - `time`, `location_name`
- API REST (`Api\GroupController`) para integração futura e testes de fumaça.
- Controller web (`GroupController`) servindo páginas Inertia.

#### UI de grupos (Inertia + React/TSX)

- **Listagem (`Groups/Index`)**
  - Lista grupos do admin autenticado.
  - Seleção múltipla com **remoção em batch** (confirmação antes de excluir).
- **Criação e edição (`Groups/Create`, `Groups/Edit`, `Groups/Form`)**
  - Formulário compartilhado com validação server-side.
  - Campo **Nome** edita o **Slug** automaticamente (apenas leitura).
  - Dia da semana via checkboxes (0–6).
- **Detalhe (`Groups/Show`)**
  - Mostra informações do grupo (incluindo próxima partida) e jogadores associados.
  - Seção dedicada em accordion para **geração de datas**:
    - Mês atual
    - Presets 3/6/12 meses
    - Seleção personalizada (1–12 meses)
  - Ação de remover grupo com confirmação.

#### Jogadores

- Endpoints de API para jogadores de grupo (`GroupPlayer`) e testes de integração.
- Gestão de jogadores na UI com lista retro, seleção e vínculo por grupo.

#### Presença e escalação

- **Admin (`Groups/MatchPresence/Manage`)**
  - Visualização de presença por partida com resumo (confirmados, desconfirmados, pendentes).
  - Geração de link público por partida para auto-confirmação dos jogadores.
  - Visualização de escalação em `RetroPitch` com reservas.
- **Jogador (`Presence/Mark`)**
  - Página pública por token para confirmar/desconfirmar presença.
  - Identificação por telefone vinculado ao grupo.
  - Atualização de status permitida a qualquer momento enquanto o link estiver válido.
- **Condição física**
  - Enum canônico no backend e TypeScript no frontend.
  - Exibição por emoji nas listas de presença.

### Planejamento e releases

- A pasta `planning/` contém:
  - `01-discovery.plan.md` — discovery e visão de produto.
  - `02-mvp-backlog.plan.md` — backlog de MVP (US-1…).
  - `03-sprint-0-tech-stack.plan.md` — decisões de stack e deploy.
- `CHANGELOG.md` documenta as mudanças de cada versão (iniciando em **v0.0.1 – Groups domain foundation**).

### Comandos úteis

- `npm install` — instalar dependências do frontend.
- `npm run dev` — Vite dev server com Inertia.
- `npm run build` — build de produção (`public/build`).
- `npm run lint` / `npm run lint:fix` — análise estática JS/TS/React.
- `npm run format` — formatação com Prettier.
- `npm run typecheck` — checagem de tipos (TypeScript) sem emitir arquivos.
