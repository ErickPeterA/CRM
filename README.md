# Nexo — CRM + Gestão de Projetos de Consultoria

Fundação self-hosted para conectar o ciclo comercial à execução de projetos de consultoria. A arquitetura e as decisões de domínio estão em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Desenvolvimento

Requisitos: Node.js 22.12+ e acesso a PostgreSQL 17.

```bash
npm install
cp .env.example .env
npm run dev
```

Configure `DATABASE_URL` somente no ambiente server-side. Para desenvolvimento via túnel SSH:

```bash
ssh -N -L 5433:postgres-main:5432 usuario@servidor
```

Use então uma URL sem credenciais reais no repositório, no formato:

```text
postgresql://crm_projetos_app:SENHA@127.0.0.1:5433/crm_projetos?sslmode=disable
```

## Migrations

O Supabase CLI é usado **somente** para migrations do PostgreSQL próprio. Não há Supabase no runtime.

```bash
npx supabase migration list --db-url "<DATABASE_URL>"
npx supabase db push --dry-run --db-url "<DATABASE_URL>"
npx supabase db push --db-url "<DATABASE_URL>"
```

Após aplicar a migration inicial, crie o primeiro usuário administrador de modo interativo. O comando exige um terminal TTY, não aceita senha em argumentos ou pipe, não exibe a senha digitada e nunca a armazena em texto puro:

```bash
npm run create-admin
```

O comando carrega automaticamente a `.env` local quando ela existir; no container, usa a `DATABASE_URL` injetada pelo ambiente. Portanto, funciona tanto com a URL local apontando para o túnel SSH quanto dentro do container de produção. Ele normaliza o email, recusa duplicidade, cria o usuário ativo e atribui o perfil `Administrador` em uma única transação.

## Validação e produção

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

O build gera `.output/server/index.mjs`. Em produção, use `HOST=0.0.0.0` e `PORT=3000`.

O endpoint `GET /health` executa `SELECT 1`; responde 200 quando o banco está disponível e 503 sem revelar dados da conexão quando está indisponível.

## Docker

O compose não cria PostgreSQL e espera a rede externa `infra_backend` e o hostname `postgres-main`.

```bash
docker build -t crm-projetos:latest .
docker compose -f compose.prod.yml up -d
docker compose -f compose.prod.yml ps
docker compose -f compose.prod.yml logs -f app
```

A publicação é restrita a `127.0.0.1:3004`; Nginx/HTTPS ficam na infraestrutura da VPS.
