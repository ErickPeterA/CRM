# Arquitetura e modelo do sistema

## 1. Visão arquitetural

O sistema começa como um **monólito modular full-stack** em TanStack Start, executado em Node.js. É uma única unidade de deploy, porém os domínios ficam separados por módulo: identidade, CRM, catálogo, comercial, projetos, equipe, conhecimento, indicadores e administração.

Fluxo principal preservado:

`Produto → Oportunidade → Proposta versionada → Contrato → Projeto (snapshot) → Escopo → Planejamento → Execução → Entregáveis → Validação → Encerramento → Aprendizado`

Princípios:

- React e rotas de UI não importam `pg`; banco, autenticação e autorização vivem em arquivos `.server.ts`.
- Server functions são a fronteira tipada da UI; server routes atendem endpoints HTTP como `/health`.
- SQL parametrizado e transações explícitas protegem operações compostas.
- PostgreSQL é a fonte de verdade. O Supabase CLI gerencia apenas migrations.
- Módulos futuros entram atrás de interfaces próprias, sem integrações externas obrigatórias.

## 2. Modelo de dados completo proposto

### Identidade e acesso

- `users` 1:N `sessions`
- `users` N:N `roles` por `user_roles`
- `roles` N:N `permissions` por `role_permissions`
- Escopo de acesso a projetos será derivado de `project_members`; perfil dá capacidade, vínculo dá alcance.

### CRM e comercial

- `clients` 1:N `contacts`
- `clients` 1:N `opportunities`; oportunidade pertence a uma etapa de `pipeline_stages`
- `opportunities` 1:N `opportunity_history`
- `opportunities` 1:N `proposals`
- `proposals` 1:N `proposal_versions`; versões enviadas são imutáveis
- `proposal_versions` 1:N `proposal_items`; cada item aponta para um produto e para a versão publicada do template usada na oferta
- `proposals` 1:N `contracts`; a política exata de múltiplos contratos permanece pendente
- `contracts` 0..1 `projects` no MVP, protegido por restrição única

### Catálogo

- `consulting_products` 1:N `product_template_versions`
- `product_template_versions` 1:N `product_template_phases`
- fase 1:N `product_template_activities` e 1:N `product_template_deliverables`
- template 1:N `product_template_risks`; dependências entre atividades em tabela associativa
- versão publicada é imutável; nova edição cria nova versão

### Projetos

- `projects` referencia cliente, proposta aceita, versão aceita e contrato assinado
- `projects` N:N `users` por `project_members`, com papel, período e capacidade alocada
- `projects` 1:1 `project_opening_terms`
- `projects` 1:N `project_phases`, `project_activities`, `project_deliverables`, `milestones`
- atividades formam EAP por `parent_activity_id`; `activity_dependencies` registra predecessoras
- `time_entries` liga profissional, projeto e opcionalmente atividade
- `pending_items`, `risks`, `issues`, `scope_changes`, `decisions`, `meetings` pertencem ao projeto
- `project_closures` 1:1 projeto; `lessons_learned` pertence ao encerramento/projeto
- cada item clonado guarda `source_template_*_id` e os dados copiados. O projeto nunca lê o template para reconstruir seu escopo operacional.

### Documentos e auditoria

- `documents` guarda metadados (`provider`, `external_id`, URL, tipo, hash e entidade relacionada), nunca binários grandes
- `audit_logs` é append-only em uso normal; não recebe senhas, hashes de senha, cookies ou tokens

## 3. Decisões de modelagem

1. **Template versionado + snapshot operacional.** Além de clonar, registra-se a origem. Isso preserva histórico e rastreabilidade sem acoplar o projeto ao catálogo mutável.
2. **Proposta como cabeçalho, versão como conteúdo comercial.** Após envio, correções geram nova versão; itens, escopo, preço e condições pertencem à versão.
3. **Conversão idempotente e transacional.** Uma chave única no contrato/proposta impede projeto duplicado; a transação valida aceite/assinatura, cria projeto, clona itens e audita.
4. **RBAC somado ao escopo de recurso.** Permissão como `projects.write` não concede todos os projetos ao consultor; a consulta também valida alocação/gestão.
5. **Arquivamento para dados históricos.** Exclusão física fica limitada a dados efêmeros ou ainda não usados; entidades comerciais e projetos recebem `archived_at`/status.
6. **Enums somente para estados estruturais estáveis.** Etapas comerciais configuráveis ficam em tabela; estados técnicos pequenos podem usar enum/check.
7. **Valores monetários.** `numeric(14,2)` + `currency char(3)`; nenhuma operação financeira usa `float`.

## 4. Ambiguidades registradas

Estas escolhas **não foram implementadas** onde afetariam substancialmente o negócio:

- uma oportunidade pode conter vários produtos? Proposta foi modelada para vários itens, mas falta confirmar a regra da oportunidade;
- um contrato pode consolidar várias propostas ou uma proposta pode gerar vários contratos/aditivos? MVP sugerido: contrato ligado a uma proposta;
- aprovação/assinatura é manual ou exige evidência/anexo? MVP proposto: status, data e usuário, com documento opcional;
- quais status e probabilidades compõem o pipeline inicial? Devem ser configuráveis antes da Fase 2;
- horas precisam de aprovação e faturabilidade? Ainda não decidido;
- capacidade é semanal, mensal ou por intervalo arbitrário? Proposta futura: disponibilidade semanal com exceções por data;
- critérios objetivos do semáforo (prazo, custo, escopo, risco) e possibilidade de override manual;
- regras de aceite de entregáveis, papéis aprovadores e reabertura;
- política de sessão (8 dias adotados na fundação), bloqueio após tentativas e recuperação de senha;
- LGPD: retenção, mascaramento e base legal de CPF/CNPJ e contatos.

## 5. Estrutura de pastas alvo

```text
src/
  components/          # UI compartilhada
  features/            # crm, catalog, commercial, projects, team
    <module>/
      *.schemas.ts     # contratos client-safe
      *.functions.ts   # fronteira RPC
      *.server.ts      # casos de uso e repositórios
  lib/                 # db, auth, audit, errors
  routes/              # páginas e endpoints HTTP
scripts/               # operações administrativas explícitas
supabase/
  config.toml
  migrations/          # único histórico estrutural
docs/                  # arquitetura e ADRs
```

Os primeiros arquivos permanecem em `src/lib` por economia de estrutura; serão movidos ao módulo correspondente quando a Fase 2 ampliar cada domínio.

## 6. Estratégia de autenticação e RBAC

- senha com Argon2id;
- token aleatório de 256 bits entregue em cookie `HttpOnly`, `SameSite=Lax`, `Secure` em produção e `Path=/`;
- somente SHA-256 do token é persistido; logout marca `revoked_at`;
- resolução de usuário e permissões acontece no backend;
- server function exige permissão central por código e, em projetos, exigirá também política de escopo;
- usuário inicial é criado por script administrativo após migrations, sem credencial padrão;
- rate limit persistente/distribuído será adicionado antes de exposição do login; proxy reverso pode complementar, não substituir.

## 7. Sequência planejada de migrations

1. `foundation_phase_1`: extensões, identidade/RBAC, clientes, contatos, catálogo/template e auditoria.
2. `commercial_pipeline`: etapas, oportunidades e histórico.
3. `proposals_contracts`: propostas, versões, itens, contratos e documentos.
4. `project_conversion`: projetos, membros, termo de abertura e snapshot do template.
5. `project_execution`: EAP, dependências, marcos, entregáveis, horas, pendências, riscos e issues.
6. `project_governance`: mudanças de escopo, decisões, reuniões e regras de semáforo.
7. `portfolio_capacity`: disponibilidade, alocações e consultas agregadas.
8. `project_closure`: encerramento e lições aprendidas.

Cada item será uma nova migration timestamped. Migrations aplicadas não serão editadas.

## 8. Plano incremental

- **Fase 1 (esta entrega):** runtime, banco, migration base, autenticação, RBAC, auditoria, layout, clientes, contatos e produtos/templates.
- **Fase 2:** pipeline configurável, oportunidades, proposta versionada e contratos.
- **Fase 3:** conversão idempotente, snapshots, termo de abertura, fases e EAP.
- **Fase 4:** entregáveis, horas, pendências, riscos e dashboard do projeto.
- **Fase 5:** portfólio, capacidade, indicadores, encerramento e lições.

Critério de saída por fase: migration revisada, build/typecheck/lint/testes, autorização server-side, auditoria das operações críticas e documentação atualizada.
