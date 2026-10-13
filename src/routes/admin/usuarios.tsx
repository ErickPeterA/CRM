import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState, type FormEvent } from 'react'
import { AppShell } from '../../components/AppShell'
import { getCurrentUser } from '../../lib/auth.functions'
import { adminData, createUser, updateUserRole } from '../../lib/catalog.functions'

export const Route=createFileRoute('/admin/usuarios')({
  beforeLoad:async()=>{const user=await getCurrentUser();if(!user)throw redirect({to:'/login'});if(!user.permissions.includes('admin.manage'))throw redirect({to:'/'});return{user}},
  loader:()=>adminData(), component:UsersPage,
})
function UsersPage(){
  const data=Route.useLoaderData(); const update=useServerFn(updateUserRole); const create=useServerFn(createUser); const router=useRouter()
  const[message,setMessage]=useState(''); const[error,setError]=useState(''); const[creating,setCreating]=useState(false)
  async function submitUpdate(event:FormEvent<HTMLFormElement>,id:string,name:string){event.preventDefault();setMessage('');setError('');const form=new FormData(event.currentTarget);try{await update({data:{id,status:String(form.get('status')) as 'active'|'inactive',roleId:String(form.get('roleId'))}});setMessage(`Acesso de ${name} atualizado.`);await router.invalidate()}catch{setError('Não foi possível atualizar o usuário. Você não pode desativar sua própria conta.')}}
  async function submitCreate(event:FormEvent<HTMLFormElement>){event.preventDefault();setMessage('');setError('');const form=new FormData(event.currentTarget);try{await create({data:{name:String(form.get('name')),email:String(form.get('email')),password:String(form.get('password')),roleId:String(form.get('roleId'))}});setCreating(false);setMessage('Usuário criado com sucesso.');await router.invalidate()}catch{setError('Não foi possível criar. Verifique o e-mail e a senha mínima de 8 caracteres.')}}
  return <AppShell>
    <div className="tabs"><Link to="/admin/usuarios" activeProps={{className:'active'}}>Usuários</Link><Link to="/admin/perfis">Perfis</Link></div>
    <header className="page-head"><div><p className="eyebrow">ADMINISTRAÇÃO</p><h1>Usuários</h1><p>Ative, desative e atribua o perfil de acesso de cada pessoa.</p></div><button className="new-button" onClick={()=>setCreating(value=>!value)}>{creating?'Fechar':'Novo usuário'}</button></header>
    {creating&&<form className="crud-form compact" onSubmit={submitCreate}><label>Nome<input name="name" required minLength={2}/></label><label>E-mail<input name="email" type="email" required/></label><label>Senha inicial<input name="password" type="password" minLength={8} autoComplete="new-password" required/></label><label>Perfil<select name="roleId" required><option value="">Selecione</option>{data.roles.map(role=><option value={role.id} key={role.id}>{role.name}</option>)}</select></label><div className="form-actions wide"><button className="primary-button">Criar usuário</button></div></form>}
    {message&&<p className="success-banner">{message}</p>}{error&&<p className="form-error">{error}</p>}
    <div className="admin-list">{data.users.map(user=><form className="admin-row" key={user.id} onSubmit={event=>submitUpdate(event,user.id,user.name)}><div><strong>{user.name}</strong><small>{user.email}</small></div><label>Status<select name="status" defaultValue={user.status==='locked'?'inactive':user.status}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label><label>Perfil<select name="roleId" defaultValue={user.role_ids[0]??''} required><option value="" disabled>Selecione</option>{data.roles.map(role=><option value={role.id} key={role.id}>{role.name}</option>)}</select></label><button className="outline-button">Salvar</button></form>)}</div>
    <p className="security-note left">Senhas e hashes nunca são exibidos. O primeiro administrador é criado pelo comando seguro documentado no README.</p>
  </AppShell>
}
