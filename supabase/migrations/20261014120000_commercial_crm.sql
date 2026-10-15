-- CRM comercial: pipeline persistente e propostas ligadas às oportunidades.

create type opportunity_stage as enum ('entrada', 'qualificacao', 'diagnostico', 'proposta', 'negociacao', 'ganho');
create type opportunity_temperature as enum ('Quente', 'Morno', 'Frio');
create type proposal_status as enum ('draft', 'sent', 'accepted', 'rejected');

create table commercial_opportunities (
  id uuid primary key default gen_random_uuid(),
  company text not null check (length(trim(company)) between 2 and 200),
  contact text not null check (length(trim(contact)) between 2 and 160),
  email citext,
  phone text,
  area text not null check (area in ('Estratégia', 'Processos', 'Pessoas', 'Financeiro')),
  stage opportunity_stage not null default 'entrada',
  estimated_value numeric(14,2) not null default 0 check (estimated_value >= 0),
  temperature opportunity_temperature not null default 'Morno',
  owner_name text not null check (length(trim(owner_name)) between 2 and 160),
  due_date date,
  notes text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index commercial_opportunities_stage_idx on commercial_opportunities(stage) where archived_at is null;
create index commercial_opportunities_owner_idx on commercial_opportunities(owner_name) where archived_at is null;

create table commercial_proposals (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null unique references commercial_opportunities(id) on delete restrict,
  version integer not null default 1 check (version > 0),
  status proposal_status not null default 'draft',
  client_company text not null,
  client_contact text not null,
  client_email citext,
  client_phone text,
  service_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(service_ids) = 'array'),
  total numeric(14,2) not null default 0 check (total >= 0),
  validity text not null default '15 dias',
  payment_terms text not null,
  notes text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  accepted_at timestamptz
);

create index commercial_proposals_status_idx on commercial_proposals(status, updated_at desc);

-- Mantém os dados de demonstração que já eram exibidos pelo protótipo, agora persistentes.
insert into commercial_opportunities
  (id, company, contact, email, phone, area, stage, estimated_value, temperature, owner_name, due_date)
values
  ('10000000-0000-4000-8000-000000000001', 'Aurora Saúde', 'Rafael Mendes', 'rafael@aurora.demo', '(11) 99999-1002', 'Processos', 'proposta', 42000, 'Quente', 'Marina Costa', '2026-10-14'),
  ('10000000-0000-4000-8000-000000000002', 'Atlas Tecnologia', 'Camila Rocha', 'camila@atlas.demo', '(41) 99999-1003', 'Estratégia', 'diagnostico', 28000, 'Quente', 'João Lima', '2026-10-15'),
  ('10000000-0000-4000-8000-000000000003', 'Horizonte Logística', 'Marina Costa', 'marina@horizonte.demo', '(19) 99999-1001', 'Financeiro', 'qualificacao', 18500, 'Morno', 'Lucas Alves', '2026-10-16'),
  ('10000000-0000-4000-8000-000000000004', 'Norte Alimentos', 'Paula Vieira', 'paula@norte.demo', '(51) 99999-2001', 'Processos', 'entrada', 32000, 'Morno', 'Marina Costa', '2026-10-18'),
  ('10000000-0000-4000-8000-000000000005', 'Órbita Engenharia', 'André Souza', 'andre@orbita.demo', '(31) 99999-2002', 'Pessoas', 'negociacao', 56000, 'Quente', 'João Lima', '2026-10-14'),
  ('10000000-0000-4000-8000-000000000006', 'Lumina Educação', 'Renata Dias', 'renata@lumina.demo', '(21) 99999-2003', 'Pessoas', 'qualificacao', 22500, 'Frio', 'Lucas Alves', '2026-10-21'),
  ('10000000-0000-4000-8000-000000000007', 'Vereda Varejo', 'Gustavo Reis', 'gustavo@vereda.demo', '(11) 99999-2004', 'Estratégia', 'ganho', 36000, 'Quente', 'Marina Costa', '2026-10-13'),
  ('10000000-0000-4000-8000-000000000008', 'Porto Digital', 'Bianca Freitas', 'bianca@porto.demo', '(81) 99999-2005', 'Processos', 'proposta', 47500, 'Morno', 'João Lima', '2026-10-17');
