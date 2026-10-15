export type UserSummary = { id: string; name: string }
export type ClientRecord = {
  id: string; legal_name: string; trade_name: string | null; type: 'company' | 'person'; tax_id: string | null
  segment: string | null; company_size: string | null; city: string | null; state: string | null
  primary_contact_name: string | null; email: string | null; phone: string | null; source: string | null
  notes: string | null; status: 'prospect' | 'active' | 'inactive'; owner_user_id: string | null
  owner_name?: string | null; contacts_count?: number
}
export type ContactRecord = { id:string; client_id:string; name:string; job_title:string|null; area:string|null; email:string|null; phone:string|null; is_primary:boolean; notes:string|null }
export type ProductRecord = { id:string; code:string; name:string; area:string; description:string; objective:string; default_duration_days:number|null; estimated_hours:string|null; team_profile:string|null; assumptions:string|null; exclusions:string|null; status:'draft'|'active'|'inactive'; phases_count?:number }
export type TemplateVersion = { id:string; product_id:string; version:number; status:'draft'|'published'|'retired'; acceptance_criteria:string|null; checklist:string[]; indicators:string[] }
export type TemplateActivity = { id:string; phase_id:string; name:string; description:string|null; sequence:number; estimated_hours:string|null; estimated_duration_days:number|null; responsible_profile:string|null }
export type TemplateDeliverable = { id:string; phase_id:string; name:string; description:string|null; acceptance_criteria:string; sequence:number }
export type TemplatePhase = { id:string; template_version_id:string; name:string; description:string|null; sequence:number; estimated_hours:string|null; estimated_duration_days:number|null; activities:TemplateActivity[]; deliverables:TemplateDeliverable[] }
export type AdminUser = { id:string; name:string; email:string; status:'active'|'inactive'|'locked'; role_ids:string[]; role_names:string[] }
export type RoleRecord = { id:string; code:string; name:string; description:string|null; is_system:boolean; permission_codes:string[] }
export type OpportunityStage = 'entrada'|'qualificacao'|'diagnostico'|'proposta'|'negociacao'|'ganho'
export type OpportunityRecord = { id:string; company:string; contact:string; email:string|null; phone:string|null; area:'Estratégia'|'Processos'|'Pessoas'|'Financeiro'; stage:OpportunityStage; estimated_value:string; temperature:'Quente'|'Morno'|'Frio'; owner_name:string; due_date:string|null; notes:string|null; proposal_id?:string|null; proposal_status?:'draft'|'sent'|'accepted'|'rejected'|null; proposal_updated_at?:string|null }
export type ProposalRecord = { id:string; opportunity_id:string; version:number; status:'draft'|'sent'|'accepted'|'rejected'; client_company:string; client_contact:string; client_email:string|null; client_phone:string|null; service_ids:string[]; total:string; validity:string; payment_terms:string; notes:string|null; created_at:string; updated_at:string }
export type ContractService = { id:string; code:string; name:string; category:string; description:string; price:number }
export type ContractStatus = 'draft'|'sent'|'signed'|'cancelled'
export type ContractRecord = { id:string; contract_number:string; proposal_id:string; opportunity_id:string; status:ContractStatus; client_company:string; client_contact:string; client_email:string|null; client_phone:string|null; services:ContractService[]; total:string; payment_terms:string; notes:string|null; document_hash:string; signature_expires_at:string|null; signer_name:string|null; signer_email:string|null; signature_evidence:Record<string, string|null>; sent_at:string|null; signed_at:string|null; signed_document_name:string|null; signed_document_mime:string|null; signed_document_uploaded_at:string|null; has_signed_document?:boolean; created_at:string; updated_at:string; area?:OpportunityRecord['area']; owner_name?:string }
