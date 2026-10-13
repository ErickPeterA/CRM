import { Link, useNavigate, useRouteContext, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import type { ReactNode } from 'react'
import { logout } from '../lib/auth.functions'

export function ProcessShell({ children, title, eyebrow, action }: { children: ReactNode; title: string; eyebrow: string; action?: ReactNode }) {
  const { user } = useRouteContext({ from: '__root__' })
  const logoutFn = useServerFn(logout)
  const navigate = useNavigate()
  const router = useRouter()

  return <div className="min-h-screen bg-[#f5f6f2] text-[#17221e] lg:grid lg:grid-cols-[268px_1fr]">
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[268px] flex-col overflow-y-auto bg-[#12382e] px-4 py-5 text-white max-lg:w-[78px] max-lg:px-3">
      <Link className="flex h-12 items-center gap-3 px-2 text-white no-underline" to="/"><img src="/Logo.png" alt="Nexo" className="size-11 object-contain" /><div className="grid max-lg:hidden"><strong className="text-[17px] leading-none">Nexo</strong><small className="mt-1 text-[8px] tracking-[1.8px] text-[#86a99b]">WORKSPACE</small></div></Link>
      <Link to="/" title="Trocar de módulo" className="group mx-1 mt-7 overflow-hidden rounded-[14px] border border-white/10 bg-white/[.055] p-4 text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:border-[#a9db8a]/40 hover:bg-white/[.09] hover:shadow-[0_12px_28px_#081d1625] max-lg:mx-0 max-lg:grid max-lg:place-items-center max-lg:p-3">
        <div className="flex items-center justify-between max-lg:hidden"><span className="text-[8px] font-bold tracking-[1.6px] text-[#83aa9b]">MÓDULO ATUAL</span><span className="text-[8px] text-[#789b8e] transition group-hover:text-[#b9dfce]">TROCAR</span></div>
        <div className="mt-3 flex items-center justify-between max-lg:mt-0"><div className="grid gap-1 max-lg:hidden"><strong className="text-[15px] font-semibold tracking-[-.2px]">Processos</strong><small className="text-[8px] text-[#7fa295]">Base operacional e serviços</small></div><ModuleSwitchIcon /></div>
      </Link>

      <SidebarSection label="GESTÃO">
        <NavLink to="/processos" icon={<HomeIcon />}>Visão geral</NavLink>
        <NavLink to="/processos/cadastro" icon={<UploadIcon />}>Cadastro por PDF</NavLink>
        <NavLink to="/processos/servicos" icon={<ListIcon />}>Serviços</NavLink>
      </SidebarSection>
      <SidebarSection label="BASE OPERACIONAL" className="mt-6 max-lg:hidden">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] text-[#82a397]"><FolderIcon /> Processos <span className="ml-auto rounded-full bg-white/[.07] px-2 py-0.5 text-[8px]">em breve</span></div>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] text-[#82a397]"><TagIcon /> Categorias <span className="ml-auto rounded-full bg-white/[.07] px-2 py-0.5 text-[8px]">em breve</span></div>
      </SidebarSection>

      <div className="mt-auto pt-6">
        <div className="flex items-center gap-2.5 rounded-xl bg-black/10 p-2.5 max-lg:justify-center max-lg:bg-transparent max-lg:p-0"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#d9ae61] text-[10px] font-extrabold text-[#19392f]">{initials(user?.name ?? '')}</span><div className="grid min-w-0 max-lg:hidden"><strong className="truncate text-[10px]">{user?.name}</strong><small className="truncate text-[8px] text-[#7fa295]">{user?.email}</small></div><button title="Sair" className="ml-auto cursor-pointer border-0 bg-transparent text-[10px] text-[#86a79a] max-lg:hidden" onClick={async () => { await logoutFn(); await router.invalidate(); await navigate({ to: '/login' }) }}>Sair</button></div>
      </div>
    </aside>

    <main className="min-h-screen lg:col-start-2 max-lg:ml-[78px]">
      <header className="flex min-h-[92px] items-center justify-between border-b border-[#dfe5e1] bg-white/70 px-[clamp(24px,4vw,58px)] py-5 backdrop-blur-sm"><div><p className="mb-1 text-[9px] font-extrabold tracking-[1.6px] text-[#7b8982]">{eyebrow}</p><h1 className="m-0 text-[clamp(1.5rem,2.7vw,2.1rem)] font-bold tracking-[-1px] text-[#17372e]">{title}</h1></div>{action}</header>
      <div className="mx-auto max-w-[1440px] p-[clamp(20px,4vw,56px)]">{children}</div>
    </main>
  </div>
}

function SidebarSection({ label, children, className = 'mt-7' }: { label: string; children: ReactNode; className?: string }) {
  return <section className={className}><p className="mb-2 px-3 text-[8px] font-bold tracking-[1.5px] text-[#688f80] max-lg:hidden">{label}</p><nav className="grid gap-1">{children}</nav></section>
}

function NavLink({ to, icon, children }: { to: '/processos' | '/processos/cadastro' | '/processos/servicos'; icon: ReactNode; children: ReactNode }) {
  return <Link to={to} activeOptions={{ exact: to === '/processos' }} activeProps={{ className: 'bg-white/10 !text-white' }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] text-[#a9c2b8] no-underline transition hover:bg-white/[.07] hover:text-white max-lg:justify-center max-lg:px-0 [&_svg]:size-4"><span>{icon}</span><span className="max-lg:hidden">{children}</span></Link>
}

function initials(name: string) { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
const svgClass = 'size-4 fill-none stroke-current stroke-[1.7]'
function HomeIcon() { return <svg viewBox="0 0 24 24" className={svgClass}><path d="m3 11 9-8 9 8v10H3V11Zm6 10v-7h6v7" /></svg> }
function UploadIcon() { return <svg viewBox="0 0 24 24" className={svgClass}><path d="M12 16V3m0 0L7 8m5-5 5 5M4 14v7h16v-7" /></svg> }
function ListIcon() { return <svg viewBox="0 0 24 24" className={svgClass}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg> }
function FolderIcon() { return <svg viewBox="0 0 24 24" className={svgClass}><path d="M3 6h7l2 2h9v11H3V6Z" /></svg> }
function TagIcon() { return <svg viewBox="0 0 24 24" className={svgClass}><path d="m20 13-7 7L3 10V3h7l10 10ZM7 7h.01" /></svg> }
function ModuleSwitchIcon() { return <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-[#9fc4b5] stroke-[1.6] transition group-hover:translate-x-0.5 group-hover:stroke-[#c9efb0]"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7m-3-3 3 3-3 3"/></svg> }
