import { Link, useNavigate, useRouteContext, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import type { ReactNode } from 'react'
import { logout } from '../lib/auth.functions'

export function CrmShell({ children, title, eyebrow, action, fluid = false }: { children: ReactNode; title: string; eyebrow: string; action?: ReactNode; fluid?: boolean }) {
  const { user } = useRouteContext({ from: '__root__' })
  const logoutFn = useServerFn(logout)
  const navigate = useNavigate()
  const router = useRouter()

  return <div className="min-h-screen bg-[#f4f5f1] text-[#17221e] lg:grid lg:grid-cols-[260px_1fr] print:block print:bg-white">
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[260px] flex-col bg-[#13382f] px-4 py-5 text-white max-lg:w-[76px] max-lg:px-3 print:hidden">
      <Link className="flex h-12 items-center gap-3 px-2 text-white no-underline" to="/"><img src="/Logopp.png?v=20261015-2" alt="Resulta" className="size-16 object-contain" /><div className="grid max-lg:hidden"><strong className="text-[17px] leading-none">Resulta</strong><small className="mt-1 text-[8px] tracking-[1.8px] text-[#86a99b]">WORKSPACE</small></div></Link>
      <Link to="/" title="Trocar de módulo" className="group mx-1 mt-7 overflow-hidden rounded-[14px] border border-white/10 bg-white/[.055] p-4 text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:border-[#8ed9c0]/40 hover:bg-white/[.09] hover:shadow-[0_12px_28px_#081d1625] max-lg:mx-0 max-lg:grid max-lg:place-items-center max-lg:p-3">
        <div className="flex items-center justify-between max-lg:hidden"><span className="text-[8px] font-bold tracking-[1.6px] text-[#83aa9b]">MÓDULO ATUAL</span><span className="text-[8px] text-[#789b8e] transition group-hover:text-[#b9dfce]">TROCAR</span></div>
        <div className="mt-3 flex items-center justify-between max-lg:mt-0"><div className="grid gap-1 max-lg:hidden"><strong className="text-[15px] font-semibold tracking-[-.2px]">CRM</strong><small className="text-[8px] text-[#7fa295]">Relacionamento e vendas</small></div><ModuleSwitchIcon /></div>
      </Link>
      <SidebarSection label="COMERCIAL">
        <NavLink to="/crm" icon={<PipelineIcon />}>Pipeline</NavLink>
        <NavLink to="/clientes" icon={<BuildingIcon />}>Clientes e contatos</NavLink>
        <NavLink to="/produtos" icon={<BoxIcon />}>Portfólio</NavLink>
      </SidebarSection>
      <SidebarSection label="GESTÃO" className="mt-6"><NavLink to="/crm/propostas" icon={<DocumentIcon />}>Propostas</NavLink><div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] text-[#82a397] max-lg:hidden"><ChartIcon /> Indicadores <span className="ml-auto text-[8px]">em breve</span></div></SidebarSection>
      <div className="mt-auto pt-6"><div className="flex items-center gap-2.5 rounded-xl bg-black/10 p-2.5 max-lg:justify-center max-lg:bg-transparent max-lg:p-0"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#d9ae61] text-[10px] font-extrabold text-[#19392f]">{initials(user?.name ?? '')}</span><div className="grid min-w-0 max-lg:hidden"><strong className="truncate text-[10px]">{user?.name}</strong><small className="truncate text-[8px] text-[#7fa295]">{user?.email}</small></div><button className="ml-auto cursor-pointer border-0 bg-transparent text-[10px] text-[#86a79a] max-lg:hidden" onClick={async () => { await logoutFn(); await router.invalidate(); await navigate({ to: '/login' }) }}>Sair</button></div></div>
    </aside>
    <main className="min-w-0 lg:col-start-2 max-lg:ml-[76px] print:m-0">
      <header className="flex min-h-[88px] items-center justify-between border-b border-[#dfe5e1] bg-white/75 px-[clamp(22px,3.5vw,52px)] py-5 backdrop-blur-sm print:hidden"><div><p className="mb-1 text-[9px] font-extrabold tracking-[1.6px] text-[#7b8982]">{eyebrow}</p><h1 className="m-0 text-[clamp(1.5rem,2.6vw,2rem)] font-bold tracking-[-1px] text-[#17372e]">{title}</h1></div>{action}</header>
      <div className={fluid ? 'p-[clamp(18px,2.5vw,36px)] print:p-0' : 'mx-auto max-w-[1440px] p-[clamp(20px,4vw,56px)] print:max-w-none print:p-0'}>{children}</div>
    </main>
  </div>
}

function SidebarSection({ label, children, className = 'mt-7' }: { label: string; children: ReactNode; className?: string }) { return <section className={className}><p className="mb-2 px-3 text-[8px] font-bold tracking-[1.5px] text-[#688f80] max-lg:hidden">{label}</p><nav className="grid gap-1">{children}</nav></section> }
function NavLink({ to, icon, children }: { to: '/crm' | '/crm/propostas' | '/clientes' | '/produtos'; icon: ReactNode; children: ReactNode }) { return <Link to={to} activeOptions={{ exact: to === '/crm' }} activeProps={{ className: 'bg-white/10 !text-white' }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] text-[#a9c2b8] no-underline transition hover:bg-white/[.07] hover:text-white max-lg:justify-center max-lg:px-0 [&_svg]:size-4"><span>{icon}</span><span className="max-lg:hidden">{children}</span></Link> }
function initials(name: string) { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
const iconClass = 'size-4 fill-none stroke-current stroke-[1.7]'
function PipelineIcon() { return <svg viewBox="0 0 24 24" className={iconClass}><path d="M4 5h16M6 9v10m6-10v10m6-10v10M4 19h16" /></svg> }
function BuildingIcon() { return <svg viewBox="0 0 24 24" className={iconClass}><path d="M4 21V3h11v18M15 9h5v12M8 7h3M8 11h3M8 15h3M2 21h20" /></svg> }
function BoxIcon() { return <svg viewBox="0 0 24 24" className={iconClass}><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v8l9 5 9-5V8M12 13v8" /></svg> }
function DocumentIcon() { return <svg viewBox="0 0 24 24" className={iconClass}><path d="M6 2h8l4 4v16H6V2Zm8 0v5h4M9 12h6M9 16h6" /></svg> }
function ChartIcon() { return <svg viewBox="0 0 24 24" className={iconClass}><path d="M4 20V10m6 10V4m6 16v-7m5 7H2" /></svg> }
function ModuleSwitchIcon() { return <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-[#9fc4b5] stroke-[1.6] transition group-hover:translate-x-0.5 group-hover:stroke-[#bce8d6]"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7m-3-3 3 3-3 3"/></svg> }
