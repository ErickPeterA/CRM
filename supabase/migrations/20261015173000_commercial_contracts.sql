-- Contratos gerados a partir de propostas aceitas, com assinatura eletrônica e comprovante.

create type contract_status as enum ('draft', 'sent', 'signed', 'cancelled');

create table commercial_contracts (
  id uuid primary key default gen_random_uuid(),
  contract_number text not null unique,
  proposal_id uuid not null unique references commercial_proposals(id) on delete restrict,
  opportunity_id uuid not null references commercial_opportunities(id) on delete restrict,
  status contract_status not null default 'draft',
  client_company text not null,
  client_contact text not null,
  client_email citext,
  client_phone text,
  services jsonb not null check (jsonb_typeof(services) = 'array'),
  total numeric(14,2) not null check (total >= 0),
  payment_terms text not null,
  notes text,
  document_hash text not null,
  signature_token_hash text unique,
  signature_expires_at timestamptz,
  signer_name text,
  signer_email citext,
  signature_evidence jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  signed_at timestamptz,
  signed_document_name text,
  signed_document_mime text,
  signed_document_data bytea,
  signed_document_uploaded_at timestamptz,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((signature_token_hash is null and signature_expires_at is null) or (signature_token_hash is not null and signature_expires_at is not null)),
  check ((signed_document_data is null and signed_document_name is null and signed_document_mime is null) or (signed_document_data is not null and signed_document_name is not null and signed_document_mime is not null))
);

create index commercial_contracts_status_idx on commercial_contracts(status, updated_at desc);
create index commercial_contracts_opportunity_idx on commercial_contracts(opportunity_id);
