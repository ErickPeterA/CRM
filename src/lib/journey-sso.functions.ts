import { createServerFn } from '@tanstack/react-start'
import { createJourneySsoCode as createJourneySsoCodeOnServer } from './journey-sso.server'

export const createJourneySsoCode = createServerFn({ method: 'POST' }).handler(() => createJourneySsoCodeOnServer())
