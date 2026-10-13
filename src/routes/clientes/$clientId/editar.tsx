import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClientForm } from '../../../components/Forms'
import { getCurrentUser } from '../../../lib/auth.functions'
export const Route=createFileRoute('/clientes/$clientId/editar')({beforeLoad:async()=>{if(!await getCurrentUser())throw redirect({to:'/login'})},component:EditClient})
function EditClient(){const {clientId}=Route.useParams();return <ClientForm id={clientId}/>}
