-- Temperatura não faz parte do modelo comercial do CRM.
alter table commercial_opportunities drop column if exists temperature;
drop type if exists opportunity_temperature;
