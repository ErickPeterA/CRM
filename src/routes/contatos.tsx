import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { AppShell } from '../components/AppShell'
import { getCurrentUser } from '../lib/auth.functions'
import { listClients } from '../lib/catalog.functions'
export const Route=createFileRoute('/contatos')({beforeLoad:async()=>{if(!await getCurrentUser())throw redirect({to:'/login'})},loader:()=>listClients(),component:ContactsPage})
function ContactsPage(){const clients=Route.useLoaderData();return <AppShell><header className="page-head"><div><p className="eyebrow">CRM</p><h1>Contatos</h1><p>Os contatos são mantidos dentro de cada cliente para preservar contexto.</p></div></header>{clients.length?<div className="client-contact-list">{clients.map(client=><Link className="card" key={client.id} to="/clientes/$clientId" params={{clientId:client.id}}><strong>{client.trade_name||client.legal_name}</strong><span>{client.contacts_count??0} contato(s)</span><small>Abrir relacionamento →</small></Link>)}</div>:<div className="empty-state"><h3>Nenhum cliente cadastrado</h3><p>Cadastre um cliente antes de adicionar contatos.</p><Link className="new-button" to="/clientes/novo">Novo cliente</Link></div>}</AppShell>}
