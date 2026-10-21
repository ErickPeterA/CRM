import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { CrmShell } from '../../components/CrmShell'
import { listProducts } from '../../lib/catalog.functions'
import type { ProductRecord } from '../../lib/domain.types'
import { processServices, type ProcessService } from '../../lib/process-services'

export const Route = createFileRoute('/produtos/')({
  beforeLoad: ({ context }) => { if (!context.user) throw redirect({ to: '/login' }) },
  loader: () => listProducts(),
  component: PortfolioPage,
})

const areas = ['Todas', 'Financeiro', 'Pessoas', 'Processos', 'Estratégia'] as const
type PortfolioArea = (typeof areas)[number]

function PortfolioPage() {
  const products = Route.useLoaderData()
  const [area, setArea] = useState<PortfolioArea>('Todas')
  const [openServiceId, setOpenServiceId] = useState<string | null>(null)
  const services = useMemo(() => processServices.filter((service) => area === 'Todas' || service.area === area), [area])

  function selectArea(nextArea: PortfolioArea) {
    setArea(nextArea)
    setOpenServiceId(null)
  }

  return <CrmShell title="Portfólio" eyebrow="CRM · SERVIÇOS, PRODUTOS E PROCESSOS" action={<Link to="/produtos/novo" className="rounded-xl bg-[#173f34] px-4 py-2.5 text-xs font-bold text-white no-underline">+ Novo produto</Link>}>
    <section className="mb-7 flex items-end justify-between gap-6 max-lg:flex-col max-lg:items-start">
      <div className="max-w-2xl"><p className="text-[9px] font-extrabold tracking-[1.4px] text-[#789087]">BIBLIOTECA DE SERVIÇOS</p><h2 className="mt-2 text-2xl font-bold tracking-[-.8px] text-[#17392f]">Escolha um serviço para acessar seus produtos.</h2><p className="mt-2 text-xs leading-6 text-[#707d77]">Ao abrir um serviço, você encontra os produtos da mesma área. Cada produto leva diretamente às fases, atividades e entregáveis do seu processo.</p></div>
      <div className="rounded-2xl border border-[#dfe5e1] bg-white px-6 py-4"><strong className="block text-2xl tracking-[-1px] text-[#173e32]">{services.length}</strong><small className="text-[9px] text-[#849089]">serviços nesta visão</small></div>
    </section>

    <nav aria-label="Filtrar portfólio por área" className="mb-6 flex flex-wrap gap-2">
      {areas.map((item) => <button key={item} type="button" onClick={() => selectArea(item)} className={`cursor-pointer rounded-full border px-4 py-2 text-[10px] font-bold transition ${area === item ? 'border-[#173e32] bg-[#173e32] text-white' : 'border-[#d9e1dc] bg-white text-[#66756e] hover:border-[#9db0a7]'}`}>{item}</button>)}
    </nav>

    {services.length ? <section className="grid gap-4">
      {services.map((service) => <ServiceRow key={service.id} service={service} products={products.filter((product) => product.area === service.area)} open={openServiceId === service.id} onToggle={() => setOpenServiceId((current) => current === service.id ? null : service.id)} />)}
    </section> : <Empty title="Nenhum serviço nesta área" description="A biblioteca do módulo Processos ainda não possui serviços classificados nesta área." />}
  </CrmShell>
}

function ServiceRow({ service, products, open, onToggle }: { service: ProcessService; products: ProductRecord[]; open: boolean; onToggle: () => void }) {
  return <article className={`overflow-hidden rounded-2xl border bg-white transition ${open ? 'border-[#92b6a5] shadow-[0_14px_36px_rgba(25,57,47,.07)]' : 'border-[#dfe5e1] hover:border-[#afc2b8]'}`}>
    <button type="button" aria-expanded={open} onClick={onToggle} className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-5 border-0 bg-white p-5 text-left md:grid-cols-[auto_1fr_auto]">
      <span className="hidden rounded-lg bg-[#edf4ef] px-2.5 py-1.5 text-[9px] font-extrabold tracking-[.8px] text-[#46705e] md:block">{service.code}</span>
      <div><div className="flex flex-wrap items-center gap-2"><h3 className="m-0 text-base font-bold tracking-[-.3px] text-[#1d4035]">{service.name}</h3><span className="rounded-full bg-[#f0f4f1] px-2.5 py-1 text-[8px] font-bold text-[#63756c]">{service.area}</span></div><p className="mt-2 mb-0 text-[11px] leading-5 text-[#75817b]">{service.description}</p></div>
      <div className="flex items-center gap-4"><span className="hidden text-right md:block"><strong className="block text-sm text-[#315f4e]">{products.length}</strong><small className="text-[8px] text-[#8a9690]">produto(s)</small></span><span className={`grid size-8 place-items-center rounded-full bg-[#eef3f0] text-[#49695c] transition ${open ? 'rotate-180' : ''}`}>⌄</span></div>
    </button>

    {open && <div className="border-t border-[#e8ece9] bg-[#f7f9f7] p-5">
      <div className="mb-4 flex items-center justify-between gap-4"><div><p className="m-0 text-[9px] font-extrabold tracking-[1.2px] text-[#71857b]">PRODUTOS DO SERVIÇO</p><p className="mt-1 mb-0 text-[9px] text-[#8a9690]">Relacionados pela área {service.area}.</p></div><span className="text-[9px] text-[#839089]">Clique para acessar o processo →</span></div>
      {products.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => <Link key={product.id} to="/produtos/$productId" params={{ productId: product.id }} className="group rounded-xl border border-[#dce4df] bg-white p-4 text-inherit no-underline transition hover:-translate-y-0.5 hover:border-[#8eb9a5] hover:shadow-[0_8px_22px_rgba(25,57,47,.06)]"><div className="flex items-center justify-between"><span className="text-[8px] font-extrabold tracking-[.9px] text-[#668075]">{product.code}</span><Status value={product.status} /></div><h4 className="mt-3 mb-1 text-[12px] text-[#21463a]">{product.name}</h4><p className="m-0 line-clamp-2 text-[9px] leading-4 text-[#7d8983]">{product.description}</p><div className="mt-4 flex items-center justify-between border-t border-[#edf0ee] pt-3 text-[9px] text-[#708078]"><span>{product.phases_count ?? 0} fases</span><strong className="text-[#346b55] transition group-hover:translate-x-0.5">Abrir processo →</strong></div></Link>)}</div> : <div className="rounded-xl border border-dashed border-[#cbd7d0] bg-white p-8 text-center"><h4 className="m-0 text-xs text-[#345347]">Nenhum produto relacionado</h4><p className="mt-2 mb-0 text-[10px] text-[#829088]">Cadastre um produto na área {service.area} para conectá-lo a este serviço.</p><Link to="/produtos/novo" className="mt-4 inline-block text-[10px] font-bold text-[#2e6b53] no-underline">Criar produto →</Link></div>}
    </div>}
  </article>
}

function Empty({ title, description }: { title: string; description: string }) { return <div className="rounded-2xl border border-dashed border-[#cad6cf] bg-white p-14 text-center"><h3 className="text-base text-[#24463a]">{title}</h3><p className="mt-2 text-xs text-[#7c8b84]">{description}</p></div> }
function Status({ value }: { value: string }) { const label: Record<string, string> = { active: 'Ativo', draft: 'Rascunho', inactive: 'Inativo' }; return <span className={`rounded-full px-2 py-1 text-[8px] font-bold ${value === 'active' ? 'bg-[#dff3e8] text-[#257051]' : value === 'draft' ? 'bg-[#fff0d6] text-[#93661d]' : 'bg-[#edf0ee] text-[#66736d]'}`}>{label[value] ?? value}</span> }
