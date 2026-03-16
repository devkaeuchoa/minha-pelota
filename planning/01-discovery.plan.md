# Discovery — Minha Pelota MVP

> **Fase**: Backlog Refinement / Ideation  
> **Objetivo**: Validar problema, personas e visão antes do desenvolvimento.

## Objective

Definir claramente o problema que o app resolve, para quem e qual a proposta de valor do MVP.

## Problem Statement

- [x] **O que** está quebrado ou ausente hoje?
  - Não há forma centralizada de gerenciar: pessoas, datas das partidas, pagamentos (aluguel do espaço), divisão de times, lista de presença
  - Tudo feito manualmente via WhatsApp e Excel
- [x] **Quem** sofre com isso?
  - Organizadores de peladas e grupos de futebol amador
  - Jogadores que precisam confirmar presença e pagar
- [x] **Por que** resolver isso importa?
  - Dor frequente (mensal/semanal); WhatsApp + Excel não escalam e geram retrabalho

## Personas / Usuários-alvo

| Persona | Descrição | Necessidade principal | Gatilho de uso |
|---------|-----------|----------------------|----------------|
| **Admin** | Grupo de 2–3 organizadores | Criar partidas, cobrar, formar times | Antes/depois de cada pelada |
| **Jogador** | Amigos do grupo + convidados esporádicos | Confirmar presença, pagar, ver escalação | Convite no grupo, lembrete de pagamento |

> MVP foca em **ambos**: o admin organiza, mas precisa dos jogadores para ter conteúdo a administrar.

## Vision (1 frase)

> Minha Pelota é o app que centraliza a gestão de grupos de futebol amador: jogadores, datas, pagamentos e formação de times, substituindo WhatsApp e Excel.

## Escopo do MVP (MoSCoW)

### Must Have
- [ ] Grupo/quadra (admin cria e gerencia)
- [ ] Cadastro e convite de jogadores
- [ ] Datas de partidas (criar e listar)
- [ ] Lista de presença ("quem vem?")
- [ ] Status de pagamento (pago / pendente)

### Should Have
- [ ] Divisão de times (manual ou automática)
- [ ] Recorrência de pagamento (mensal / semanal)

### Could Have
- [ ] Histórico de partidas
- [ ] Notificações / lembretes

### Won't Have (v1)
- [ ] Pagamento integrado (PIX, cartão)
- [ ] Estatísticas de jogadores
- [ ] Convites automáticos por e-mail/SMS

## Assumptions & Risks

- **Premissas**: Grupo já existe e usa WhatsApp; admins aceitam migrar para um app; jogadores acessam web ou mobile.
- **Riscos**: Baixa adoção se onboarding for complexo; necessidade de PIX integrado pode emergir cedo.

## Next Steps

1. ~~Validar problem statement~~ ✅ Discovery concluído
2. Refinar backlog com user stories (02-mvp-backlog.plan.md)
3. Sprint 0: definir tech stack e setup inicial
