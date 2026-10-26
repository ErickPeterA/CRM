import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createJourneyResultSsoUrl, createJourneySsoCode as createJourneySsoCodeOnServer } from './journey-sso.server'

export const createJourneySsoCode = createServerFn({ method: 'POST' }).handler(() => createJourneySsoCodeOnServer())
export const createJourneyResultUrl = createServerFn({ method: 'POST' })
  .validator(z.object({opportunityId:z.uuid()}))
  .handler(({data})=>createJourneyResultSsoUrl(data.opportunityId))
