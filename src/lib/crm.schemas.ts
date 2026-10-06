import { z } from 'zod'

const optionalText = z.string().trim().max(500).optional().or(z.literal(''))

export const clientSchema = z.object({
  legalName: z.string().trim().min(2).max(200),
  tradeName: optionalText,
  type: z.enum(['company', 'person']),
  taxId: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.email().optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  status: z.enum(['prospect', 'active', 'inactive']),
})

export const contactSchema = z.object({
  clientId: z.uuid(),
  name: z.string().trim().min(2).max(160),
  jobTitle: optionalText,
  email: z.email().optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  isPrimary: z.boolean().default(false),
})

export const productSchema = z.object({
  code: z.string().trim().regex(/^[A-Z0-9][A-Z0-9_-]*$/).max(40),
  name: z.string().trim().min(2).max(160),
  area: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(4000),
  objective: z.string().trim().min(10).max(4000),
  defaultDurationDays: z.number().int().positive().optional(),
  estimatedHours: z.number().nonnegative().optional(),
})
