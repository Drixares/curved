import { z } from 'zod'

export const issueSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  priority: z.string(),
  status: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    type: z.string(),
  }),
  team: z.object({
    id: z.string(),
    identifier: z.string(),
  }),
  labels: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
    }),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Issue = z.infer<typeof issueSchema>
