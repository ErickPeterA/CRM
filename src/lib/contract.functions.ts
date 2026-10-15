import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server'
import { requirePermission } from './auth.server'
import { contractFromProposalSchema, contractSignatureSchema, idSchema, signatureLinkSchema, signatureTokenSchema, signedDocumentSchema } from './crm.schemas'
import { createContractRecord, createContractSignatureLink, downloadSignedContractRecord, getContractRecord, getPublicContractRecord, listContractRecords, signContractRecord, uploadSignedContractRecord } from './contract.server'

export const listContracts=createServerFn({method:'GET'}).handler(async()=>{await requirePermission('commercial.read');return listContractRecords()})
export const getContract=createServerFn({method:'GET'}).validator(idSchema).handler(async({data})=>{await requirePermission('commercial.read');return getContractRecord(data.id)})
export const createContractFromProposal=createServerFn({method:'POST'}).validator(contractFromProposalSchema).handler(async({data})=>createContractRecord(data.proposalId,await requirePermission('commercial.write')))
export const createSignatureLink=createServerFn({method:'POST'}).validator(signatureLinkSchema).handler(async({data})=>createContractSignatureLink(data.contractId,await requirePermission('commercial.write')))
export const getPublicContract=createServerFn({method:'GET'}).validator(signatureTokenSchema).handler(async({data})=>getPublicContractRecord(data.token))
export const signPublicContract=createServerFn({method:'POST'}).validator(contractSignatureSchema).handler(async({data})=>signContractRecord(data,{ip:getRequestIP({xForwardedFor:true}),userAgent:getRequestHeader('user-agent')}))
export const uploadSignedContract=createServerFn({method:'POST'}).validator(signedDocumentSchema).handler(async({data})=>uploadSignedContractRecord(data,await requirePermission('commercial.write')))
export const downloadSignedContract=createServerFn({method:'GET'}).validator(idSchema).handler(async({data})=>{await requirePermission('commercial.read');return downloadSignedContractRecord(data.id)})
