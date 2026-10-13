-- Fase 1 operacional: campos de cadastro e metadados de template.
alter table clients
  add column segment text,
  add column company_size text,
  add column city text,
  add column state char(2),
  add column source text,
  add column primary_contact_name text;

alter table contacts add column area text;

alter table product_template_phases add column estimated_duration_days integer check (estimated_duration_days > 0);
alter table product_template_activities add column estimated_duration_days integer check (estimated_duration_days > 0);

create index clients_name_idx on clients (legal_name) where archived_at is null;
create index users_status_idx on users (status) where deactivated_at is null;
