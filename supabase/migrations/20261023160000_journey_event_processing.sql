-- Vínculos comerciais e idempotência para eventos posteriores da Jornada.
alter table commercial_opportunities
  add column client_id uuid references clients(id) on delete set null,
  add column contact_id uuid references contacts(id) on delete set null;

create index commercial_opportunities_client_idx on commercial_opportunities (client_id) where archived_at is null;
create index commercial_opportunities_contact_idx on commercial_opportunities (contact_id) where archived_at is null;

alter table journey_instances add column last_event_at timestamptz;

create table journey_event_receipts (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  external_journey_id text not null,
  event_type text not null,
  occurred_at timestamptz,
  processed_at timestamptz not null default now()
);

create index journey_event_receipts_journey_idx on journey_event_receipts (external_journey_id, occurred_at desc);
