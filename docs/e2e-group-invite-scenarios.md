## E2E - Convites por link

Baseado na seção **6. Convites por link** do manual de testes.

### Pré-condições

- Seed padrão carregada (`DatabaseSeeder`).
- Owner para login: `11988888888` / `password`.
- Grupos com `group_settings` e `invite_token` (criação via factory / boot do `Group`).

### Cenários

#### 1) Gerar convite e aceitar

- **Dado**: grupo de teste com convite válido (link visível na seção **4. CONVITE** ou após **GERAR LINK DE CONVITE**).
- **Quando**: acessar `/invite/{token}`, preencher nome, apelido, telefone (novo no sistema), validar telefone no blur, enviar **PARTICIPAR**.
- **Esperado**:
  - Redirecionamento para `/invite/{token}/success`.
  - Tela de sucesso menciona o nome do grupo.
  - No backend: jogador criado ou reaproveitado por telefone, vínculo em `group_player` com `is_admin = false` (coberto em testes de feature; E2E foca no fluxo de UI).

#### 2) Token inválido

- **Quando**: acessar `/invite/{token}` com token inexistente.
- **Esperado**: resposta HTTP **404**.

#### 3) Token expirado

- **Dado**: grupo **E2E Invite Expired** no seed, com `invite_expires_at` no passado (token ainda salvo em `group_settings`).
- **Quando**: abrir o mesmo link de convite exibido na UI do grupo (ou navegar para `/invite/{token}` com esse token).
- **Esperado**: resposta HTTP **404** na página de aceite (mesmo comportamento que token inexistente no `InviteController@show`).
