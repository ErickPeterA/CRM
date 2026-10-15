import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/contatos')({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: '/login' })
    throw redirect({ to: '/clientes' })
  },
})
