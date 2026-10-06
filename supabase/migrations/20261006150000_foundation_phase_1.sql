-- CRM + Projetos de Consultoria — fundação e Fase 1.
-- PostgreSQL 17 puro. O histórico é gerenciado exclusivamente pelo Supabase CLI.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type user_status as enum ('active', 'inactive', 'locked');
create type client_type as enum ('company', 'person');
create type client_status as enum ('prospect', 'active', 'inactive');
create type product_status as enum ('draft', 'active', 'inactive');

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 160),
  email citext not null unique,
  password_hash text not null,
  status user_status not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deactivated_at timestamptz
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ip_hash text,
  user_agent text,
  check (expires_at > created_at)
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z][a-z0-9._-]*$'),
  name text not null unique,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z][a-z0-9._-]*$'),
  description text not null,
  created_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  granted_by uuid references users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  type client_type not null default 'company',
  legal_name text not null check (length(trim(legal_name)) between 2 and 200),
  trade_name text,
  tax_id text,
  email citext,
  phone text,
  website text,
  status client_status not null default 'prospect',
  notes text,
  owner_user_id uuid references users(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create unique index clients_tax_id_unique on clients (tax_id) where tax_id is not null and archived_at is null;
create index clients_status_idx on clients (status) where archived_at is null;
create index clients_owner_idx on clients (owner_user_id) where archived_at is null;

create table contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete restrict,
  name text not null check (length(trim(name)) between 2 and 160),
  job_title text,
  email citext,
  phone text,
  mobile text,
  is_primary boolean not null default false,
  notes text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create unique index contacts_one_primary_per_client_idx on contacts (client_id) where is_primary and archived_at is null;
create index contacts_client_idx on contacts (client_id) where archived_at is null;
create index contacts_email_idx on contacts (email) where archived_at is null;

create table consulting_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9][A-Z0-9_-]*$'),
  name text not null,
  area text not null,
  description text not null,
  objective text not null,
  default_duration_days integer check (default_duration_days > 0),
  estimated_hours numeric(10,2) check (estimated_hours >= 0),
  team_profile text,
  assumptions text,
  exclusions text,
  status product_status not null default 'draft',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index consulting_products_status_idx on consulting_products (status) where archived_at is null;
create index consulting_products_area_idx on consulting_products (area) where archived_at is null;

-- Um produto tem versões imutáveis de template. Apenas uma versão pode estar publicada.
create table product_template_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references consulting_products(id) on delete restrict,
  version integer not null check (version > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  acceptance_criteria text,
  checklist jsonb not null default '[]'::jsonb check (jsonb_typeof(checklist) = 'array'),
  indicators jsonb not null default '[]'::jsonb check (jsonb_typeof(indicators) = 'array'),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (product_id, version)
);

create unique index product_template_one_published_idx on product_template_versions(product_id) where status = 'published';

create table product_template_phases (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references product_template_versions(id) on delete cascade,
  name text not null,
  description text,
  sequence integer not null check (sequence > 0),
  estimated_hours numeric(10,2) check (estimated_hours >= 0),
  unique (template_version_id, sequence)
);

create table product_template_activities (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references product_template_phases(id) on delete cascade,
  parent_activity_id uuid references product_template_activities(id) on delete restrict,
  name text not null,
  description text,
  sequence integer not null check (sequence > 0),
  estimated_hours numeric(10,2) check (estimated_hours >= 0),
  responsible_profile text,
  unique (phase_id, sequence)
);

create table product_template_deliverables (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references product_template_phases(id) on delete cascade,
  name text not null,
  description text,
  acceptance_criteria text not null,
  sequence integer not null check (sequence > 0),
  unique (phase_id, sequence)
);

create table product_template_risks (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references product_template_versions(id) on delete cascade,
  title text not null,
  description text,
  probability smallint check (probability between 1 and 5),
  impact smallint check (impact between 1 and 5),
  response_plan text
);

create table audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references users(id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index audit_logs_entity_idx on audit_logs (entity_type, entity_id, occurred_at desc);
create index audit_logs_actor_idx on audit_logs (actor_user_id, occurred_at desc);
create index sessions_user_active_idx on sessions (user_id, expires_at) where revoked_at is null;

insert into permissions (code, description) values
  ('admin.manage', 'Gerenciar usuários, perfis e parâmetros'),
  ('crm.read', 'Consultar clientes e contatos'),
  ('crm.write', 'Criar e alterar clientes e contatos'),
  ('catalog.read', 'Consultar produtos de consultoria'),
  ('catalog.write', 'Criar e alterar produtos e templates'),
  ('commercial.read', 'Consultar oportunidades, propostas e contratos'),
  ('commercial.write', 'Gerenciar oportunidades, propostas e contratos'),
  ('projects.read', 'Consultar projetos permitidos'),
  ('projects.write', 'Gerenciar projetos permitidos'),
  ('portfolio.read', 'Consultar portfólio e indicadores consolidados');

insert into roles (code, name, description, is_system) values
  ('administrator', 'Administrador', 'Acesso total ao sistema', true),
  ('manager', 'Gerente', 'Gestão de projetos, equipes e aprovações', true),
  ('consultant', 'Consultor', 'Execução dos projetos em que está alocado', true),
  ('sales', 'Comercial', 'CRM, propostas e contratos', true),
  ('executive', 'Diretoria', 'Dashboards e indicadores consolidados', true);

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p where r.code = 'administrator';

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code = any(array['crm.read','catalog.read','projects.read','projects.write','portfolio.read']) where r.code = 'manager';

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code = any(array['catalog.read','projects.read','projects.write']) where r.code = 'consultant';

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code = any(array['crm.read','crm.write','catalog.read','commercial.read','commercial.write']) where r.code = 'sales';

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code = any(array['crm.read','catalog.read','commercial.read','projects.read','portfolio.read']) where r.code = 'executive';
