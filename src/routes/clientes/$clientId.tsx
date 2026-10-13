import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { AppShell } from '../../components/AppShell'
import { ContactManager } from '../../components/ContactManager'
import { getCurrentUser } from '../../lib/auth.functions'
import { archiveClient, getClient } from '../../lib/catalog.functions'

export const Route=createFileRoute('/clientes/$clientId')({
  beforeLoad:async()=>{if(!await getCurrentUser())throw redirect({to:'/login'})},
  loader:({params})=>getClient({data:{id:params.clientId}}), component:ClientDetail,
})
function ClientDetail(){
  const {client,contacts}=Route.useLoaderData();const archive=useServerFn(archiveClient);const router=useRouter();const navigate=useNavigate()
  const refresh=async()=>{await router.invalidate()}
  return <AppShell><div className="breadcrumbs"><Link to="/clientes">Clientes</Link><span>/</span><span>{client.trade_name||client.legal_name}</span></div><header className="page-head"><div><p className="eyebrow">CLIENTE</p><h1>{client.trade_name||client.legal_name}</h1><p>{client.legal_name} · {client.status}</p></div><div className="page-actions"><Link className="outline-button" to="/clientes/$clientId/editar" params={{clientId:client.id}}>Editar</Link><button className="danger-button" onClick={async()=>{if(confirm(`Arquivar ${client.trade_name||client.legal_name}?`)){await archive({data:{id:client.id}});await navigate({to:'/clientes'})}}}>Arquivar</button></div></header>
  <section className="details-grid"><div><span>CNPJ/CPF</span><strong>{client.tax_id||'—'}</strong></div><div><span>Segmento</span><strong>{client.segment||'—'}</strong></div><div><span>Porte</span><strong>{client.company_size||'—'}</strong></div><div><span>Localização</span><strong>{[client.city,client.state].filter(Boolean).join(' / ')||'—'}</strong></div><div><span>E-mail</span><strong>{client.email||'—'}</strong></div><div><span>Telefone</span><strong>{client.phone||'—'}</strong></div><div><span>Origem</span><strong>{client.source||'—'}</strong></div><div><span>Responsável principal</span><strong>{client.primary_contact_name||'—'}</strong></div></section>
  <ContactManager clientId={client.id} contacts={contacts} onChanged={refresh}/></AppShell>
}
