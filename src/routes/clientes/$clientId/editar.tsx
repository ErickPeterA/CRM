import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClientForm } from '../../../components/Forms'
export const Route=createFileRoute('/clientes/$clientId/editar')({beforeLoad:({context})=>{if(!context.user)throw redirect({to:'/login'})},component:EditClient})
function EditClient(){const {clientId}=Route.useParams();return <ClientForm id={clientId}/>}
