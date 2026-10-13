import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { ProcessShell } from '../../../components/ProcessShell'
import { getCurrentUser } from '../../../lib/auth.functions'
import { processServices, serviceCategories } from '../../../lib/process-services'

export const Route = createFileRoute('/processos/servicos/')({
  beforeLoad: async () => { if (!await getCurrentUser()) throw redirect({ to: '/login' }) },
  component: ServicesLibrary,
})

function ServicesLibrary() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    return processServices.filter((service) => (category === 'Todos' || service.category === category) && (!term || [service.name, service.description, service.code, service.category].some((value) => value.toLocaleLowerCase('pt-BR').includes(term))))
  }, [search, category])

  return <ProcessShell title="Serviços" eyebrow="PROCESSOS · BIBLIOTECA OPERACIONAL" action={<Link to="/processos/cadastro" className="rounded-[10px] bg-[#173e32] px-4 py-2.5 text-[11px] font-bold text-white no-underline">＋ Importar serviços</Link>}>
    <section className="flex items-end justify-between gap-8 max-lg:flex-col max-lg:items-start"><div className="max-w-[650px]"><span className="text-[9px] font-extrabold tracking-[1.5px] text-[#789087]">CONHECIMENTO CENTRALIZADO</span><h2 className="mt-2 mb-3 text-[clamp(1.8rem,3vw,2.7rem)] font-semibold tracking-[-1.5px] text-[#17392f]">Tudo que a equipe precisa saber para executar.</h2><p className="text-[13px] leading-6 text-[#707d77]">Consulte os serviços identificados nos documentos importados e acesse as orientações detalhadas de cada atividade.</p></div><div className="rounded-2xl border border-[#dfe5e1] bg-white px-6 py-4 text-right max-lg:text-left"><strong className="block text-2xl tracking-[-1px] text-[#173e32]">{processServices.length}</strong><small className="text-[9px] text-[#849089]">serviços disponíveis</small></div></section>

    <section className="mt-9 rounded-2xl border border-[#dfe5e1] bg-white p-4">
      <div className="relative"><svg viewBox="0 0 24 24" className="absolute top-1/2 left-4 size-4 -translate-y-1/2 fill-none stroke-[#738079] stroke-2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, código, categoria ou descrição…" className="h-12 w-full rounded-xl border border-[#dce3df] bg-[#fafbf9] pr-4 pl-11 text-xs outline-none transition placeholder:text-[#9ba49f] focus:border-[#6d9b87] focus:ring-4 focus:ring-[#6d9b8715]" /></div>
      <div className="mt-3 flex flex-wrap gap-2">{serviceCategories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`cursor-pointer rounded-full border px-3 py-1.5 text-[9px] font-bold transition ${category === item ? 'border-[#173e32] bg-[#173e32] text-white' : 'border-[#dce3df] bg-white text-[#6d7973] hover:border-[#9db0a7]'}`}>{item}</button>)}</div>
    </section>

    <div className="mt-5 flex items-center justify-between"><p className="m-0 text-[10px] text-[#7d8983]"><strong className="text-[#26362f]">{filtered.length}</strong> resultado(s)</p><span className="text-[9px] text-[#929c97]">Ordenado por nome</span></div>
    {filtered.length ? <section className="mt-3 grid grid-cols-2 gap-3.5 max-xl:grid-cols-1">{filtered.map((service) => <Link key={service.id} to="/processos/servicos/$serviceId" params={{ serviceId: service.id }} className="group relative overflow-hidden rounded-2xl border border-[#dfe5e1] bg-white p-5 text-[#17231e] no-underline transition duration-200 hover:-translate-y-0.5 hover:border-[#a8bcb1] hover:shadow-[0_12px_35px_#173e3212]"><div className="flex items-start justify-between gap-4"><span className="rounded-lg bg-[#edf4ef] px-2.5 py-1.5 text-[9px] font-extrabold tracking-[.8px] text-[#46705e]">{service.code}</span><span className="text-lg text-[#9aa69f] transition group-hover:translate-x-1 group-hover:text-[#39745c]">→</span></div><h3 className="mt-5 mb-2 text-[16px] font-bold tracking-[-.3px] group-hover:text-[#28634e]">{service.name}</h3><p className="line-clamp-2 min-h-10 text-[11px] leading-5 text-[#75817b]">{service.description}</p><div className="mt-5 flex items-center gap-2 border-t border-[#edf0ee] pt-4"><span className="rounded-full bg-[#f2f4f2] px-2.5 py-1 text-[8px] font-bold text-[#66736c]">{service.category}</span><span className="text-[8px] text-[#929c97]">{service.frequency}</span><span className="ml-auto text-[8px] text-[#929c97]">{service.steps.length} etapas</span></div></Link>)}</section> : <div className="mt-3 rounded-2xl border border-dashed border-[#cad5cf] bg-white py-16 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-[#eef3f0] text-xl text-[#668176]">⌕</span><h3 className="mt-4 text-sm">Nenhum serviço encontrado</h3><p className="mt-1 text-[10px] text-[#88948e]">Tente outro termo ou remova o filtro de categoria.</p></div>}
  </ProcessShell>
}
