import type { OpportunityRecord } from '../lib/domain.types'
import { areaLabel } from '../lib/opportunity-area'

const areaStyles: Record<OpportunityRecord['area'], string> = {
  Financeiro: 'bg-[#e7f2eb] text-[#2f684f]',
  Processos: 'bg-[#e7f0f5] text-[#3f6f89]',
  Pessoas: 'bg-[#f8eddf] text-[#98652e]',
  Estratégia: 'bg-[#f1eaf6] text-[#765694]',
}

export function AreaBadge({ area }: { area: OpportunityRecord['area'] }) {
  return <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[8px] font-extrabold uppercase tracking-[.35px] ${areaStyles[area]}`}>{areaLabel(area)}</span>
}
