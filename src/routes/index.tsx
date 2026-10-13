import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { logout, getCurrentUser } from '../lib/auth.functions'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  component: ModuleHub,
})

const modules = [
  { name: 'Processos', slug: 'processos', number: '01', description: 'Padronize rotinas, responsabilidades e fluxos da operação.', detail: 'Mapeamento e governança', iconClass: 'bg-[#ecf4e5] text-[#50852f]', glowClass: 'bg-[#c5ec9a]', icon: <FlowIcon /> },
  { name: 'CRM', slug: 'crm', number: '02', description: 'Centralize clientes, contatos e oportunidades comerciais.', detail: 'Relacionamento e vendas', iconClass: 'bg-[#2a5b50] text-[#aee7ce]', glowClass: 'bg-[#83d65a]', icon: <PeopleIcon />, featured: true },
  { name: 'Contratos', slug: 'contratos', number: '03', description: 'Acompanhe documentos, vigências, valores e compromissos.', detail: 'Controle e conformidade', iconClass: 'bg-[#fff3db] text-[#9a6b20]', glowClass: 'bg-[#ebb750]', icon: <DocumentIcon /> },
  { name: 'Execução', slug: 'execucao', number: '04', description: 'Conduza entregas, atividades e o trabalho em andamento.', detail: 'Operação em tempo real', iconClass: 'bg-[#f1edfa] text-[#7857a5]', glowClass: 'bg-[#a383d9]', icon: <BoltIcon /> },
  { name: 'Projetos', slug: 'projetos', number: '05', description: 'Planeje iniciativas, equipes, prazos e resultados esperados.', detail: 'Planejamento e impacto', iconClass: 'bg-[#fbeceb] text-[#a75254]', glowClass: 'bg-[#e58f8d]', icon: <LayersIcon /> },
] as const

function ModuleHub() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const logoutFn = useServerFn(logout)
  const firstName = user.name.split(' ')[0]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f4ee] text-[#14231e]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(23,59,46,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,59,46,0.035)_1px,transparent_1px)] bg-[size:70px_70px] [mask-image:linear-gradient(to_bottom,black,transparent_68%)]" />

      <header className="relative z-10 flex h-[68px] items-center justify-between border-b border-[#18392d1a] px-[clamp(24px,5vw,76px)] max-md:h-[74px]">
        <div className="flex items-center gap-3 text-[21px] font-bold text-[#153c30]">
          <img src="/Logo.png" alt="Nexo" className="size-20 object-contain" />
          <span>Nexo</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[#d9e8de] text-[11px] font-extrabold text-[#255344]">{initials(user.name)}</span>
          <div className="grid gap-0.5 max-md:hidden"><strong className="text-xs">{user.name}</strong><small className="text-[10px] text-[#74817b]">{user.email}</small></div>
          <button className="ml-3 cursor-pointer rounded-lg border border-[#d6ddd8] bg-white/60 px-2 py-1 text-[11px] text-[#50605a] transition hover:bg-white max-md:ml-0" type="button" onClick={async () => { await logoutFn(); await navigate({ to: '/login' }) }}>Sair</button>
        </div>
      </header>

      <section className="relative z-[1] flex min-h-[395px] items-center justify-between px-[clamp(24px,8vw,130px)] py-[60px] max-lg:min-h-[350px] max-md:min-h-[330px] max-md:pt-[50px]">
        <div className="max-w-[740px]">
          <p className="mb-[22px] flex items-center gap-2.5 text-[10px] font-extrabold uppercase tracking-[1.8px] text-[#496057]"><span className="size-[7px] rounded-full bg-[#91cb51] shadow-[0_0_0_5px_#91cb511d]" /> Ambiente de trabalho</p>
          <h1 className="m-0 text-[4rem] leading-[1.04] font-semibold tracking-[-3.6px] text-[#15392e] max-md:tracking-[-2.2px]">
            Olá, {firstName}.<br /><em className="font-normal not-italic text-[#6a766f]">Onde vamos trabalhar hoje?</em>
          </h1>
        </div>
        <div className="relative mr-[4vw] size-[290px] shrink-0 max-lg:hidden" aria-hidden="true">
          <div className="absolute inset-7 rounded-full border border-[#1e5a4530]" />
          <div className="absolute inset-0 animate-[spin_35s_linear_infinite] rounded-full border border-dashed border-[#1e5a4530]" />
          <div className="absolute inset-[88px] grid place-content-center rounded-full bg-[#153e32] text-center text-[#b7ed7e] shadow-[0_20px_55px_#173e3235]"><img src="/Logo.png" alt="" className="size-16 object-contain" /></div>
          <i className="absolute top-[31px] left-[62px] size-3.5 rounded-full border-4 border-[#f3f4ee] bg-[#79bf4d] shadow-[0_3px_10px_#153e3230]" />
          <i className="absolute top-[151px] right-[19px] size-3.5 rounded-full border-4 border-[#f3f4ee] bg-[#52b8b0] shadow-[0_3px_10px_#153e3230]" />
          <i className="absolute bottom-4 left-[116px] size-3.5 rounded-full border-4 border-[#f3f4ee] bg-[#d8a94f] shadow-[0_3px_10px_#153e3230]" />
        </div>
      </section>

      <section className="relative z-[2] px-[clamp(24px,5vw,76px)] pb-[60px] max-md:pb-9" aria-labelledby="module-title">
        <div className="mb-5 flex items-end justify-between border-b border-[#173b2e22] pb-5">
          <div><span className="text-[9px] font-extrabold tracking-[1.7px] text-[#829088]">SEUS ESPAÇOS</span><h2 className="mt-1.5 text-[25px] font-semibold tracking-[-.7px]">Módulos disponíveis</h2></div>
          <p className="m-0 text-[11px] text-[#829088]">05 áreas conectadas</p>
        </div>
        <div className="grid auto-rows-[300px] grid-cols-6 gap-3.5 max-lg:auto-rows-[285px] max-lg:grid-cols-2 max-md:auto-rows-[270px] max-md:grid-cols-1">
          {modules.map((module, index) => {
            const featured = 'featured' in module && module.featured
            const cardClass = `${index < 2 ? 'col-span-3' : 'col-span-2'} group relative flex flex-col overflow-hidden rounded-[18px] border p-6 no-underline transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_#213c2d18] max-lg:col-span-1 max-md:col-span-1 ${featured ? 'border-[#153d31] bg-[#153d31] text-white' : 'border-[#dde3de] bg-white text-[#18251f] hover:border-[#b9c9bf]'} ${index === modules.length - 1 ? 'max-lg:col-span-2 max-md:col-span-1' : ''}`
            const content = <>
              <span className={`absolute -top-20 -right-20 size-[190px] rounded-full opacity-15 blur-[75px] ${module.glowClass}`} />
              <div className="relative flex items-start justify-between"><span className={`text-[10px] font-semibold tracking-[1.4px] ${featured ? 'text-[#87a398]' : 'text-[#9aa59f]'}`}>{module.number}</span><div className={`grid size-[43px] place-items-center rounded-xl [&_svg]:size-[21px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.7] ${module.iconClass}`}>{module.icon}</div></div>
              <div className="relative mt-auto"><small className={`text-[9px] tracking-[1.1px] uppercase ${featured ? 'text-[#91b0a4]' : 'text-[#7f8b85]'}`}>{module.detail}</small><h3 className="my-2 text-[27px] font-bold tracking-[-.8px]">{module.name}</h3><p className={`m-0 max-w-[330px] text-xs leading-[1.55] ${featured ? 'text-[#b5c9c1]' : 'text-[#69766f]'}`}>{module.description}</p></div>
              <div className={`relative mt-6 flex items-center justify-between border-t pt-4 text-[10px] font-extrabold tracking-[.8px] uppercase ${featured ? 'border-white/15 text-[#d6e9e0]' : 'border-[#e6eae7]'}`}><span>Acessar módulo</span><b className="text-lg font-normal transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">↗</b></div>
            </>
            if (module.slug === 'crm') return <Link key={module.slug} className={cardClass} to="/crm">{content}</Link>
            if (module.slug === 'processos') return <Link key={module.slug} className={cardClass} to="/processos">{content}</Link>
            return <Link key={module.slug} className={cardClass} to="/modulos/$module" params={{ module: module.slug }}>{content}</Link>
          })}
        </div>
      </section>

      <footer className="relative z-[2] flex items-center justify-between border-t border-[#173b2e1a] px-[clamp(24px,5vw,76px)] py-6 text-[9px] tracking-[1.2px] text-[#8a958f]"><span>NEXO WORKSPACE</span><p className="m-0 text-[11px] tracking-normal text-[#6f7b75] max-md:hidden">Todos os módulos, uma só operação.</p><span>v1.0</span></footer>
    </main>
  )
}

function initials(name: string) { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
function FlowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v5m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 4v5m12-7V6m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0v12m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM8 11h8" /></svg> }
function PeopleIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 19c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4v1h13v-1ZM9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 0 0 0-6m1.5 9c1.7.3 3 1.8 3 3.6V18h-2" /></svg> }
function DocumentIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6V2Zm8 0v5h4M9 12h6M9 16h6" /></svg> }
function BoltIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.5 2-8 12h6l-1 8 8-12h-6l1-8Z" /></svg> }
function LayersIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5" /></svg> }
