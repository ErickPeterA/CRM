import { describe, expect, it } from 'vitest'
import { activitySchema, clientSchema, contactSchema, contractSignatureSchema, deliverableSchema, phaseSchema, productSchema, signedDocumentSchema, userCreateSchema, userUpdateSchema } from './crm.schemas'

describe('validação de clientes e contatos', () => {
  it('aceita cliente completo e normalizável', () => expect(clientSchema.safeParse({legalName:'Acme Consultoria',type:'company',status:'active',state:'sp'}).success).toBe(true))
  it('rejeita UF inválida', () => expect(clientSchema.safeParse({legalName:'Acme',type:'company',status:'active',state:'São Paulo'}).success).toBe(false))
  it('exige vínculo do contato com cliente', () => expect(contactSchema.safeParse({clientId:'inválido',name:'Maria',isPrimary:false}).success).toBe(false))
})
describe('validação do produto e template', () => {
  const product={code:'DIAG_FIN',name:'Diagnóstico financeiro',area:'Financeiro',description:'Descrição suficientemente completa',objective:'Objetivo suficientemente completo',status:'draft',checklist:[],indicators:[]}
  it('aceita produto estruturado', () => expect(productSchema.safeParse(product).success).toBe(true))
  it('rejeita código fora do padrão', () => expect(productSchema.safeParse({...product,code:'produto inválido'}).success).toBe(false))
  it('valida fase, atividade e entregável', () => {const productId='123e4567-e89b-42d3-a456-426614174000',phaseId='123e4567-e89b-42d3-a456-426614174001';expect(phaseSchema.safeParse({productId,name:'Diagnóstico',sequence:1}).success).toBe(true);expect(activitySchema.safeParse({productId,phaseId,name:'Entrevistas',sequence:1}).success).toBe(true);expect(deliverableSchema.safeParse({productId,phaseId,name:'Relatório',acceptanceCriteria:'Aprovação formal',sequence:1}).success).toBe(true)})
})
describe('validação administrativa', () => {it('aceita atualização de status e perfil',()=>expect(userUpdateSchema.safeParse({id:'123e4567-e89b-42d3-a456-426614174000',roleId:'123e4567-e89b-42d3-a456-426614174001',status:'active'}).success).toBe(true));it('normaliza email e exige senha mínima',()=>{const parsed=userCreateSchema.safeParse({name:'Maria Silva',email:' MARIA@EMPRESA.COM ',password:'segura123',roleId:'123e4567-e89b-42d3-a456-426614174001'});expect(parsed.success).toBe(true);if(parsed.success)expect(parsed.data.email).toBe('maria@empresa.com');expect(userCreateSchema.safeParse({name:'Maria',email:'maria@empresa.com',password:'123',roleId:'123e4567-e89b-42d3-a456-426614174001'}).success).toBe(false)})})
describe('validação de contratos',()=>{
  const token='a'.repeat(43)
  it('exige aceite explícito para assinatura',()=>{expect(contractSignatureSchema.safeParse({token,signerName:'Maria Silva',signerEmail:'maria@empresa.com',acceptedTerms:true}).success).toBe(true);expect(contractSignatureSchema.safeParse({token,signerName:'Maria Silva',signerEmail:'maria@empresa.com',acceptedTerms:false}).success).toBe(false)})
  it('aceita somente PDF no comprovante assinado',()=>{const base={contractId:'123e4567-e89b-42d3-a456-426614174000',name:'contrato.pdf',dataBase64:'YWJj'};expect(signedDocumentSchema.safeParse({...base,mimeType:'application/pdf'}).success).toBe(true);expect(signedDocumentSchema.safeParse({...base,mimeType:'image/png'}).success).toBe(false)})
})
