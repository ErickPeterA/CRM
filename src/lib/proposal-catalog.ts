import { processServices } from './process-services'

export const servicePrices: Record<string, number> = {
  'conciliacao-bancaria': 4800,
  'contas-a-pagar': 6200,
  'contas-a-receber': 5900,
  'emissao-nota-fiscal': 3500,
  'fechamento-mensal': 7800,
  'cadastro-fornecedor': 2900,
}

export function snapshotServices(serviceIds: string[]) {
  return serviceIds.map((id) => {
    const service = processServices.find((item) => item.id === id)
    if (!service) return null
    return { id: service.id, code: service.code, name: service.name, category: service.category, description: service.description, price: servicePrices[id] ?? 0 }
  }).filter((service): service is NonNullable<typeof service> => Boolean(service))
}
