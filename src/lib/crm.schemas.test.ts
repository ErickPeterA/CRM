import { describe, expect, it } from 'vitest'
import { clientSchema, productSchema } from './crm.schemas'

describe('validação de domínio da fundação', () => {
  it('aceita um cliente válido', () => {
    expect(clientSchema.safeParse({ legalName: 'Acme Consultoria', type: 'company', status: 'prospect' }).success).toBe(true)
  })
  it('rejeita código de produto fora do padrão', () => {
    expect(productSchema.safeParse({ code: 'produto inválido', name: 'Diagnóstico', area: 'Estratégia', description: 'Descrição completa', objective: 'Objetivo completo' }).success).toBe(false)
  })
})
