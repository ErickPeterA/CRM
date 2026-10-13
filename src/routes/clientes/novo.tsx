import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClientForm } from '../../components/Forms'
export const Route=createFileRoute('/clientes/novo')({beforeLoad:({context})=>{if(!context.user)throw redirect({to:'/login'})},component:()=> <ClientForm />})
