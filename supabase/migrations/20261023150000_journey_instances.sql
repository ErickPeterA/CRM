-- Instâncias da Jornada do Empreendedor vinculadas a oportunidades do CRM.
create table journey_instances (
  id uuid primary key default gen_random_uuid(),
  external_journey_id text not null unique,
  opportunity_id uuid not null unique references commercial_opportunities(id) on delete restrict,
  status text not null check (status in ('generated', 'shared', 'started', 'identified', 'in_progress', 'completed', 'revoked', 'expired', 'failed')),
  expires_at timestamptz,
  started_at timestamptz,
  identified_at timestamptz,
  completed_at timestamptz,
  progress integer check (progress between 0 and 100),
  diagnostic_summary jsonb,
  result_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journey_instances_status_idx on journey_instances (status, created_at desc);
