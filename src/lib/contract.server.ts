import '@tanstack/react-start/server-only'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { query, transaction } from './db.server'
import { snapshotServices } from './proposal-catalog'
import type { ContractRecord, ProposalRecord } from './domain.types'
import type { SessionUser } from './auth.server'

const contractColumns = `c.id,c.contract_number,c.proposal_id,c.opportunity_id,c.status,c.client_company,c.client_contact,c.client_email::text,c.client_phone,c.services,c.total,c.payment_terms,c.notes,c.document_hash,c.signature_expires_at::text,c.signer_name,c.signer_email::text,c.signature_evidence,c.sent_at::text,c.signed_at::text,c.signed_document_name,c.signed_document_mime,c.signed_document_uploaded_at::text,(c.signed_document_data is not null) has_signed_document,c.created_at::text,c.updated_at::text`
const hash = (value: string) => createHash('sha256').update(value).digest('hex')

export async function listContractRecords() {
  return (await query<ContractRecord>(`select ${contractColumns},o.area,o.owner_name from commercial_contracts c join commercial_opportunities o on o.id=c.opportunity_id order by c.updated_at desc`)).rows
}

export async function getContractRecord(id: string) {
  const contract = (await query<ContractRecord>(`select ${contractColumns},o.area,o.owner_name from commercial_contracts c join commercial_opportunities o on o.id=c.opportunity_id where c.id=$1`, [id])).rows[0]
  if (!contract) throw new Error('NOT_FOUND')
  return contract
}

export async function createContractRecord(proposalId: string, actor: SessionUser) {
  return transaction(async (client) => {
    const existing = await client.query<{ id: string }>('select id from commercial_contracts where proposal_id=$1', [proposalId])
    if (existing.rows[0]) return { id: existing.rows[0].id }
    const proposal = (await client.query<ProposalRecord & { opportunity_company: string }>(`select p.*,o.company opportunity_company from commercial_proposals p join commercial_opportunities o on o.id=p.opportunity_id where p.id=$1 for update`, [proposalId])).rows[0]
    if (!proposal) throw new Error('NOT_FOUND')
    if (proposal.status !== 'accepted') throw new Error('PROPOSAL_NOT_ACCEPTED')
    const services = snapshotServices(proposal.service_ids)
    if (!services.length) throw new Error('EMPTY_SCOPE')
    const id = randomUUID()
    const contractNumber = `CTR-${new Date().getFullYear()}-${id.slice(0, 8).toUpperCase()}`
    const documentHash = hash(JSON.stringify({ proposalId, client: proposal.client_company, services, total: proposal.total, paymentTerms: proposal.payment_terms, notes: proposal.notes }))
    await client.query(`insert into commercial_contracts(id,contract_number,proposal_id,opportunity_id,client_company,client_contact,client_email,client_phone,services,total,payment_terms,notes,document_hash,created_by) values($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14)`, [id,contractNumber,proposal.id,proposal.opportunity_id,proposal.client_company,proposal.client_contact,proposal.client_email,proposal.client_phone,JSON.stringify(services),proposal.total,proposal.payment_terms,proposal.notes,documentHash,actor.id])
    await client.query('insert into audit_logs(actor_user_id,entity_type,entity_id,action,new_values) values($1,$2,$3,$4,$5::jsonb)', [actor.id,'commercial_contract',id,'created_from_accepted_proposal',JSON.stringify({proposalId,contractNumber,total:proposal.total})])
    return { id }
  })
}

export async function createContractSignatureLink(contractId: string, actor: SessionUser) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + 7 * 86_400_000)
  await transaction(async (client) => {
    const contract = (await client.query<{ status: string }>('select status from commercial_contracts where id=$1 for update', [contractId])).rows[0]
    if (!contract) throw new Error('NOT_FOUND')
    if (contract.status === 'signed') throw new Error('ALREADY_SIGNED')
    await client.query("update commercial_contracts set status='sent',signature_token_hash=$1,signature_expires_at=$2,sent_at=coalesce(sent_at,now()),updated_at=now() where id=$3", [hash(token),expiresAt,contractId])
    await client.query('insert into audit_logs(actor_user_id,entity_type,entity_id,action,new_values) values($1,$2,$3,$4,$5::jsonb)', [actor.id,'commercial_contract',contractId,'signature_link_created',JSON.stringify({expiresAt:expiresAt.toISOString()})])
  })
  return { token, expiresAt: expiresAt.toISOString() }
}

export async function getPublicContractRecord(token: string) {
  const contract = (await query<ContractRecord>(`select ${contractColumns} from commercial_contracts c where c.signature_token_hash=$1 and c.signature_expires_at>now() and c.status in ('sent','signed')`, [hash(token)])).rows[0]
  if (!contract) throw new Error('INVALID_OR_EXPIRED_LINK')
  return contract
}

export async function signContractRecord(input: { token: string; signerName: string; signerEmail: string }, requestEvidence: { ip?:string; userAgent?:string } = {}) {
  return transaction(async (client) => {
    const contract = (await client.query<{ id:string; status:string; document_hash:string }>('select id,status,document_hash from commercial_contracts where signature_token_hash=$1 and signature_expires_at>now() for update', [hash(input.token)])).rows[0]
    if (!contract) throw new Error('INVALID_OR_EXPIRED_LINK')
    if (contract.status === 'signed') return { id: contract.id, alreadySigned: true }
    const signedAt = new Date().toISOString()
    const signatureEvidence = { method:'secure_link',signerName:input.signerName,signerEmail:input.signerEmail,signedAt,documentHash:contract.document_hash,ipHash:requestEvidence.ip?hash(requestEvidence.ip):null,userAgentHash:requestEvidence.userAgent?hash(requestEvidence.userAgent):null }
    await client.query("update commercial_contracts set status='signed',signer_name=$1,signer_email=$2,signature_evidence=$3::jsonb,signed_at=$4,signature_token_hash=null,signature_expires_at=null,updated_at=now() where id=$5", [input.signerName,input.signerEmail,JSON.stringify(signatureEvidence),signedAt,contract.id])
    await client.query('insert into audit_logs(entity_type,entity_id,action,new_values,metadata) values($1,$2,$3,$4::jsonb,$5::jsonb)', ['commercial_contract',contract.id,'signed_via_secure_link',JSON.stringify({signerName:input.signerName,signerEmail:input.signerEmail,signedAt}),JSON.stringify({documentHash:contract.document_hash})])
    return { id: contract.id, alreadySigned: false }
  })
}

export async function uploadSignedContractRecord(input: { contractId:string; name:string; mimeType:string; dataBase64:string }, actor: SessionUser) {
  const data = Buffer.from(input.dataBase64, 'base64')
  if (!data.length || data.length > 10 * 1024 * 1024) throw new Error('INVALID_FILE_SIZE')
  await transaction(async (client) => {
    const found = await client.query('select 1 from commercial_contracts where id=$1 for update', [input.contractId])
    if (!found.rowCount) throw new Error('NOT_FOUND')
    await client.query("update commercial_contracts set status='signed',signed_document_name=$1,signed_document_mime=$2,signed_document_data=$3,signed_document_uploaded_at=now(),signed_at=coalesce(signed_at,now()),signature_token_hash=null,signature_expires_at=null,signature_evidence=signature_evidence||$4::jsonb,updated_at=now() where id=$5", [input.name,input.mimeType,data,JSON.stringify({method:'uploaded_signed_pdf',uploadedBy:actor.id,uploadedAt:new Date().toISOString()}),input.contractId])
    await client.query('insert into audit_logs(actor_user_id,entity_type,entity_id,action,new_values) values($1,$2,$3,$4,$5::jsonb)', [actor.id,'commercial_contract',input.contractId,'signed_document_uploaded',JSON.stringify({name:input.name,size:data.length})])
  })
  return { ok:true }
}

export async function downloadSignedContractRecord(contractId: string) {
  const file = (await query<{name:string;mime_type:string;data:Buffer}>('select signed_document_name name,signed_document_mime mime_type,signed_document_data data from commercial_contracts where id=$1 and signed_document_data is not null', [contractId])).rows[0]
  if (!file) throw new Error('NOT_FOUND')
  return { name:file.name, mimeType:file.mime_type, dataBase64:file.data.toString('base64') }
}
