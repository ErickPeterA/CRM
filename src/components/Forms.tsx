import { useServerFn } from '@tanstack/react-start'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from './AppShell'
import { getClient, listActiveUsers, saveClient } from '../lib/catalog.functions'
import type { ClientRecord, UserSummary } from '../lib/domain.types'

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('clients_tax_id_unique') || message.includes('duplicate key')) return 'Já existe um cliente ativo com este CPF/CNPJ.'
  if (message.includes('column') && message.includes('does not exist')) return 'O banco ainda não recebeu a atualização de cadastro. Aplique a migration operacional antes de salvar.'
  if (message.includes('PERMISSION_DENIED')) return 'Seu usuário não tem permissão para cadastrar clientes.'
  if (message.includes('AUTHENTICATION_REQUIRED')) return 'Sua sessão expirou. Entre novamente.'
  return 'Não foi possível salvar o cliente. Verifique os dados e tente novamente.'
}

export function ClientForm({ id }: { id?: string }) {
  const save = useServerFn(saveClient)
  const loadUsers = useServerFn(listActiveUsers)
  const loadClient = useServerFn(getClient)
  const navigate = useNavigate()
  const [client, setClient] = useState<ClientRecord>()
  const [users, setUsers] = useState<UserSummary[]>([])
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    loadUsers().then(setUsers).catch(() => setError('Não foi possível carregar os responsáveis.'))
    if (id) loadClient({ data: { id } }).then(result => setClient(result.client)).catch(() => setError('Cliente não encontrado.'))
  }, [id, loadClient, loadUsers])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    const form = new FormData(event.currentTarget)
    try {
      const result = await save({ data: {
        id, legalName: String(form.get('legalName') ?? ''), tradeName: String(form.get('tradeName') ?? ''),
        type: String(form.get('type')) as 'company' | 'person', taxId: String(form.get('taxId') ?? ''),
        segment: String(form.get('segment') ?? ''), companySize: String(form.get('companySize') ?? ''), city: String(form.get('city') ?? ''), state: String(form.get('state') ?? ''),
        primaryContactName: String(form.get('primaryContactName') ?? ''), email: String(form.get('email') ?? ''), phone: String(form.get('phone') ?? ''),
        source: String(form.get('source') ?? ''), notes: String(form.get('notes') ?? ''), status: String(form.get('status')) as 'prospect' | 'active' | 'inactive', ownerUserId: String(form.get('ownerUserId') ?? ''),
      } })
      await navigate({ to: '/clientes/$clientId', params: { clientId: result.id } })
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  return <AppShell><div className="breadcrumbs"><Link to="/clientes">Clientes</Link><span>/</span><span>{id ? 'Editar' : 'Novo'}</span></div><header className="page-head"><div><p className="eyebrow">CRM</p><h1>{id ? 'Editar cliente' : 'Novo cliente'}</h1></div></header><form key={client?.id ?? 'new'} className="crud-form" onSubmit={submit}>
    <label>Razão social<input name="legalName" defaultValue={client?.legal_name} required minLength={2}/></label><label>Nome fantasia<input name="tradeName" defaultValue={client?.trade_name ?? ''}/></label>
    <label>Tipo<select name="type" defaultValue={client?.type ?? 'company'}><option value="company">Empresa</option><option value="person">Pessoa</option></select></label><label>CNPJ/CPF<input name="taxId" defaultValue={client?.tax_id ?? ''}/></label>
    <label>Segmento<input name="segment" defaultValue={client?.segment ?? ''}/></label><label>Porte<input name="companySize" defaultValue={client?.company_size ?? ''}/></label><label>Cidade<input name="city" defaultValue={client?.city ?? ''}/></label><label>Estado<input name="state" maxLength={2} defaultValue={client?.state ?? ''}/></label>
    <label>Responsável principal<input name="primaryContactName" defaultValue={client?.primary_contact_name ?? ''}/></label><label>E-mail<input name="email" type="email" defaultValue={client?.email ?? ''}/></label><label>Telefone<input name="phone" defaultValue={client?.phone ?? ''}/></label><label>Origem<input name="source" defaultValue={client?.source ?? ''}/></label>
    <label>Status<select name="status" defaultValue={client?.status ?? 'prospect'}><option value="prospect">Prospect</option><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label><label>Comercial/consultor responsável<select name="ownerUserId" defaultValue={client?.owner_user_id ?? ''}><option value="">Não definido</option>{users.map(user => <option value={user.id} key={user.id}>{user.name}</option>)}</select></label><label className="wide">Observações<textarea name="notes" defaultValue={client?.notes ?? ''}/></label>
    {error && <p className="form-error wide" role="alert">{error}</p>}<div className="form-actions wide"><Link className="outline-button" to={id ? '/clientes/$clientId' : '/clientes'} params={id ? { clientId: id } : undefined}>Cancelar</Link><button className="primary-button" disabled={pending}>{pending ? 'Salvando…' : 'Salvar cliente'}</button></div>
  </form></AppShell>
}
