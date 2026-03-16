import { z } from 'zod'

export const issueSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
})

export type Issue = z.infer<typeof issueSchema>
