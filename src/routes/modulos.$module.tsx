import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '../lib/auth.functions'

const moduleInfo: Record<string, { name: string; eyebrow: string; description: string; items: string[] }> = {
  processos: { name: 'Processos', eyebrow: 'OPERAÇÃO E GOVERNANÇA', description: 'Desenhe, organize e acompanhe os processos que sustentam sua operação.', items: ['Visão geral', 'Mapa de processos', 'Procedimentos', 'Indicadores'] },
  contratos: { name: 'Contratos', eyebrow: 'CONTROLE E CONFORMIDADE', description: 'Tenha clareza sobre documentos, prazos, valores e responsabilidades.', items: ['Visão geral', 'Contratos', 'Aprovações', 'Vencimentos'] },
  execucao: { name: 'Execução', eyebrow: 'TRABALHO EM ANDAMENTO', description: 'Coordene atividades e acompanhe as entregas da equipe em um só lugar.', items: ['Visão geral', 'Minhas atividades', 'Equipe', 'Apontamentos'] },
  projetos: { name: 'Projetos', eyebrow: 'PLANEJAMENTO E IMPACTO', description: 'Planeje iniciativas, distribua recursos e acompanhe cada marco do projeto.', items: ['Visão geral', 'Portfólio', 'Cronogramas', 'Resultados'] },
}

export const Route = createFileRoute('/modulos/$module')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  component: ModulePage,
})

function ModulePage() {
  const { module } = Route.useParams()
  const { user } = Route.useRouteContext()
  const info = moduleInfo[module]
  if (!info) return <main className="grid min-h-screen place-content-center text-center"><p className="text-xs font-bold tracking-widest text-slate-500">MÓDULO</p><h1 className="text-4xl font-bold">Módulo não encontrado</h1><Link className="mx-auto mt-4 rounded-lg bg-[#123d32] px-5 py-3 text-white no-underline" to="/">Voltar aos módulos</Link></main>

  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] bg-[#f5f6f2] max-md:grid-cols-[72px_1fr]">
      <aside className="fixed inset-y-0 left-0 flex w-[250px] flex-col bg-[#143b30] px-[17px] pt-7 pb-[18px] text-white max-md:w-[72px] max-md:px-2.5 max-md:pt-5">
        <Link className="flex items-center gap-3 px-2 text-[21px] font-bold text-white no-underline max-md:px-0" to="/"><img src="/Logo.png" alt="Nexo" className="size-10 object-contain" /><strong className="max-md:hidden">Nexo</strong></Link>
        <Link to="/" title="Trocar de módulo" className="group mx-[7px] mt-[34px] mb-[18px] overflow-hidden rounded-[14px] border border-white/10 bg-white/[.055] p-4 text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:border-[#a9db8a]/40 hover:bg-white/[.09] max-md:mx-0 max-md:grid max-md:place-items-center max-md:p-3"><div className="flex items-center justify-between max-md:hidden"><small className="text-[8px] font-bold tracking-[1.6px] text-[#83aa9b]">MÓDULO ATUAL</small><span className="text-[8px] text-[#789b8e] group-hover:text-[#b9dfce]">TROCAR</span></div><div className="mt-3 flex items-center justify-between max-md:mt-0"><div className="grid gap-1 max-md:hidden"><strong className="text-[15px] font-semibold">{info.name}</strong><small className="text-[8px] text-[#7fa295]">Acessar outros espaços</small></div><ModuleSwitchIcon /></div></Link>
        <nav className="grid gap-1 max-md:mt-9">
          {info.items.map((item, index) => <button key={item} className={`flex items-center gap-2.5 rounded-lg border-0 px-2.5 py-3 text-left text-xs ${index === 0 ? 'bg-white/10 text-white' : 'bg-transparent text-[#9db7ad] max-md:hidden'}`} type="button" disabled={index !== 0}><span className="w-[18px]">{index === 0 ? '⌂' : '○'}</span>{item}{index !== 0 && <small className="ml-auto text-[8px] text-[#668a7c]">em breve</small>}</button>)}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-[7px] py-2.5 max-md:p-0"><span className="grid size-[34px] place-items-center rounded-full bg-[#d5ab5d] text-[10px] font-extrabold text-[#173b31]">{initials(user.name)}</span><div className="grid min-w-0 max-md:hidden"><strong className="text-[11px]">{user.name}</strong><small className="overflow-hidden text-[9px] text-ellipsis text-[#7fa294]">{user.email}</small></div></div>
      </aside>

      <main className="col-start-2 px-[clamp(28px,5vw,70px)] py-10 max-md:px-[18px] max-md:py-6">
        <header className="flex items-center justify-between"><div><small className="text-[9px] font-extrabold tracking-[1.5px] text-[#77847d]">{info.eyebrow}</small><h1 className="mt-1.5 text-[34px] font-bold tracking-[-1px]">{info.name}</h1></div><span className="flex items-center gap-2 rounded-full border border-[#d9e1dc] bg-white px-3 py-2 text-[10px] text-[#607068] max-md:hidden"><i className="size-1.5 rounded-full bg-[#79bd4e]" /> Ambiente preparado</span></header>

        <section className="relative mt-10 grid min-h-[370px] grid-cols-[1.25fr_.75fr] items-center gap-8 overflow-hidden rounded-[20px] bg-[#173e32] p-[55px] text-white max-lg:grid-cols-1 max-md:min-h-[350px] max-md:p-8">
          <div className="relative z-[1]"><span className="text-[9px] font-extrabold tracking-[1.5px] text-[#b2e27c]">PRÓXIMA ETAPA</span><h2 className="my-4 max-w-[680px] text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.1] font-semibold tracking-[-1.7px]">Seu espaço de {info.name.toLowerCase()} está pronto para evoluir.</h2><p className="max-w-[600px] text-[13px] leading-7 text-[#b8cbc3]">{info.description} As funcionalidades deste módulo serão adicionadas nas próximas etapas.</p><Link className="mt-5 inline-flex gap-5 text-[11px] font-bold text-[#d9edc7] no-underline" to="/">Explorar outros módulos <b>→</b></Link></div>
          <div className="relative z-[1] h-[230px] max-lg:hidden" aria-hidden="true"><span className="absolute inset-[15px] rounded-full border border-[#a8de713d]" /><span className="absolute inset-12 rounded-full border border-[#a8de713d]" /><span className="absolute inset-[82px] rounded-full border border-[#a8de713d] bg-[#b0e6751a]" /><i className="absolute top-7 right-12 size-[18px] rounded-full bg-[#a9e36d] shadow-[0_0_0_7px_#a9e36d1c]" /></div>
          <div aria-hidden="true" className="absolute -right-[180px] -bottom-[250px] size-[400px] rounded-full border border-white/5 shadow-[0_0_0_70px_#ffffff08,0_0_0_140px_#ffffff05]" />
        </section>

        <section className="mt-3.5 grid grid-cols-3 gap-3.5 max-md:grid-cols-1">
          <InfoCard number="01" title="Estrutura dedicada">Uma navegação própria para as necessidades deste módulo.</InfoCard>
          <InfoCard number="02" title="Informação conectada">Dados integrados aos demais espaços da plataforma.</InfoCard>
          <InfoCard number="03" title="Evolução contínua">Novas funções serão incorporadas sem perder simplicidade.</InfoCard>
        </section>
      </main>
    </div>
  )
}

function InfoCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <article className="min-h-[165px] rounded-[14px] border border-[#e0e5e1] bg-white p-6"><span className="text-[9px] font-extrabold text-[#92a098]">{number}</span><h3 className="mt-7 mb-2 text-[15px] font-semibold">{title}</h3><p className="m-0 text-[11px] leading-[1.55] text-[#78847e]">{children}</p></article>
}

function initials(name: string) { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
function ModuleSwitchIcon() { return <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-[#9fc4b5] stroke-[1.6] transition group-hover:translate-x-0.5 group-hover:stroke-[#c9efb0]"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7m-3-3 3 3-3 3"/></svg> }
