import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useMemo, useState, type DragEvent } from 'react'
import { CrmShell } from '../components/CrmShell'
import { crmAreas, initialOpportunities, pipelineStages, type Opportunity, type PipelineStage } from '../lib/crm-pipeline'

export const Route = createFileRoute('/crm')({
  beforeLoad: ({ context }) => { if (!context.user) throw redirect({ to: '/login' }) },
  component: CrmKanban,
})

function CrmKanban() {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [area, setArea] = useState<(typeof crmAreas)[number]>('Todas as áreas')
  const [search, setSearch] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    return opportunities.filter((item) => (area === 'Todas as áreas' || item.area === area) && (!term || [item.company, item.contact, item.area].some((value) => value.toLocaleLowerCase('pt-BR').includes(term))))
  }, [opportunities, area, search])

  function moveCard(event: DragEvent, stage: PipelineStage) {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/opportunity') || dragging
    if (id) setOpportunities((current) => current.map((item) => item.id === id ? { ...item, stage } : item))
    setDragging(null)
  }

  const total = visible.reduce((sum, item) => sum + item.value, 0)
  return <CrmShell title="Pipeline comercial" eyebrow="CRM · JORNADA DE VENDAS" fluid action={<button className="rounded-[10px] border-0 bg-[#173e32] px-4 py-2.5 text-[11px] font-bold text-white">＋ Nova oportunidade</button>}>
    <section className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6"><div><strong className="block text-xl tracking-[-.8px]">{formatCurrency(total)}</strong><small className="text-[9px] text-[#839089]">valor no pipeline exibido</small></div><div className="h-9 w-px bg-[#d9e0dc]" /><div><strong className="block text-xl tracking-[-.8px]">{visible.length}</strong><small className="text-[9px] text-[#839089]">oportunidades</small></div></div>
      <div className="flex items-center gap-2"><div className="relative"><span className="absolute top-1/2 left-3 -translate-y-1/2 text-[#819088]">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Buscar oportunidade…" className="h-10 w-[230px] rounded-[10px] border border-[#d8dfdb] bg-white pr-3 pl-9 text-[10px] outline-none focus:border-[#6f9b87]" /></div><button className="h-10 rounded-[10px] border border-[#d8dfdb] bg-white px-3 text-[10px] font-bold text-[#68766f]">Filtros</button></div>
    </section>

    <section className="mb-5 flex flex-wrap items-center gap-2"><span className="mr-2 text-[9px] font-bold tracking-[1.2px] text-[#8a9690]">ÁREAS</span>{crmAreas.map((item) => <button key={item} onClick={() => setArea(item)} className={`cursor-pointer rounded-full border px-3 py-1.5 text-[9px] font-bold transition ${area === item ? 'border-[#173e32] bg-[#173e32] text-white' : 'border-[#d8dfdb] bg-white text-[#68766f] hover:border-[#a9bbb2]'}`}>{item}</button>)}<span className="ml-auto hidden items-center gap-1.5 text-[9px] text-[#8a9690] lg:flex"><i className="size-1.5 rounded-full bg-[#76ad57]" /> Arraste os cards para atualizar a etapa</span></section>

    <section className="overflow-x-auto pb-4 [scrollbar-color:#b8c5be_transparent]">
      <div className="grid min-w-[1820px] grid-cols-6 gap-3.5">
        {pipelineStages.map((stage) => {
          const cards = visible.filter((item) => item.stage === stage.id)
          const stageTotal = cards.reduce((sum, item) => sum + item.value, 0)
          return <div key={stage.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => moveCard(event, stage.id)} className={`min-h-[610px] rounded-2xl border p-3 transition ${dragging ? 'border-[#a9c1b5] bg-[#eef3ef]' : stage.id === 'proposta' ? 'border-[#d8cee3] bg-[#f5f1f8]' : 'border-[#e0e5e1] bg-[#ecefeb]'}`}>
            <header className="mb-3 px-1 py-1"><div className="flex items-center gap-2"><i className="size-2 rounded-full" style={{ backgroundColor: stage.color }} /><h2 className="text-[11px] font-extrabold tracking-[.2px]">{stage.name}</h2><span className="ml-auto grid size-5 place-items-center rounded-full bg-white text-[8px] font-bold text-[#748079]">{cards.length}</span></div><p className="mt-1.5 ml-4 text-[9px] text-[#88948e]">{formatCurrency(stageTotal)}</p></header>
            <div className="grid gap-2.5">{cards.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onDragStart={(event) => { event.dataTransfer.setData('text/opportunity', opportunity.id); event.dataTransfer.effectAllowed = 'move'; setDragging(opportunity.id) }} onDragEnd={() => setDragging(null)} dragging={dragging === opportunity.id} />)}</div>
            <button className="mt-3 w-full cursor-pointer rounded-xl border border-dashed border-[#cdd6d1] bg-white/40 py-3 text-[9px] font-bold text-[#87938d] hover:bg-white">＋ Adicionar cartão</button>
          </div>
        })}
      </div>
    </section>
  </CrmShell>
}

function OpportunityCard({ opportunity, onDragStart, onDragEnd, dragging }: { opportunity: Opportunity; onDragStart: (event: DragEvent<HTMLElement>) => void; onDragEnd: () => void; dragging: boolean }) {
  return <article draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className={`group cursor-grab rounded-xl border border-[#dde3df] bg-white p-3.5 shadow-[0_2px_7px_#263b3008] transition hover:-translate-y-0.5 hover:border-[#aebfb6] hover:shadow-[0_9px_22px_#263b3012] active:cursor-grabbing ${dragging ? 'rotate-2 opacity-40' : ''}`}>
    <div className="flex items-start justify-between"><span className="rounded-md bg-[#f2f4f2] px-2 py-1 text-[8px] font-extrabold text-[#68766f]">{opportunity.area.toUpperCase()}</span><span className="text-[#a1aaa5]">⋮</span></div>
    <div className="mt-4 flex items-center gap-2.5"><span className="grid size-9 shrink-0 place-items-center rounded-[10px] text-[9px] font-extrabold text-[#395b4d]" style={{ backgroundColor: opportunity.color }}>{opportunity.initials}</span><div className="min-w-0"><h3 className="truncate text-[12px] font-bold">{opportunity.company}</h3><p className="mt-1 truncate text-[9px] text-[#849089]">{opportunity.contact}</p></div></div>
    <div className="mt-4 flex items-end justify-between"><div><small className="block text-[8px] text-[#929c97]">Valor estimado</small><strong className="mt-1 block text-[12px]">{formatCurrency(opportunity.value)}</strong></div><span className={`rounded-full px-2 py-1 text-[7px] font-extrabold ${opportunity.temperature === 'Quente' ? 'bg-[#fbe8df] text-[#a55732]' : opportunity.temperature === 'Morno' ? 'bg-[#f7f0dc] text-[#9a752c]' : 'bg-[#eaf0f3] text-[#607b89]'}`}>{opportunity.temperature.toUpperCase()}</span></div>
    <div className="mt-4 flex items-center border-t border-[#edf0ee] pt-3"><span className="grid size-6 place-items-center rounded-full bg-[#173e32] text-[7px] font-bold text-white">{initials(opportunity.owner)}</span><small className="ml-2 text-[8px] text-[#7f8b85]">{opportunity.dueDate}</small>{opportunity.stage === 'proposta' ? <Link draggable={false} to="/crm/propostas/$opportunityId" params={{ opportunityId: opportunity.id }} className="ml-auto rounded-lg bg-[#eee8f4] px-2.5 py-1.5 text-[8px] font-extrabold text-[#765694] no-underline transition hover:bg-[#dfd2eb]">MONTAR PROPOSTA →</Link> : <span className="ml-auto text-[8px] text-[#a0aaa5]">•••</span>}</div>
  </article>
}

function initials(name: string) { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
function formatCurrency(value: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value) }
