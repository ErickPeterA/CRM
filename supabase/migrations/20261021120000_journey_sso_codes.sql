-- Códigos temporários de uso único para o SSO CRM -> Jornada.
create table sso_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create index sso_codes_active_expiration_idx
  on sso_codes (expires_at)
  where used_at is null;
