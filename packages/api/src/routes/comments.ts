import { and, eq, isNull, asc } from 'drizzle-orm'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { db } from '../db'
import { comment, issue } from '../db/schema'
import type { AuthVariables } from '../middleware/auth'

export const commentRoutes = new Hono<{ Variables: AuthVariables }>()
  // GET /api/issues/:issueId/comments
  .get('/issues/:issueId/comments', async (c) => {
    const session = c.get('session')
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const { issueId } = c.req.param()

    // Verify issue belongs to the user's org
    const found = await db.query.issue.findFirst({
      where: and(eq(issue.id, issueId), isNull(issue.deletedAt)),
      with: { team: { columns: { organizationId: true } } },
    })

    if (!found || found.team.organizationId !== orgId) {
      return c.json({ error: 'Issue not found' }, 404)
    }

    // Fetch top-level comments with replies
    const comments = await db.query.comment.findMany({
      where: and(eq(comment.issueId, issueId), isNull(comment.parentId), isNull(comment.deletedAt)),
      orderBy: [asc(comment.createdAt)],
      with: {
        author: { columns: { id: true, name: true, image: true } },
        replies: {
          where: isNull(comment.deletedAt),
          orderBy: [asc(comment.createdAt)],
          with: {
            author: { columns: { id: true, name: true, image: true } },
          },
        },
      },
    })

    return c.json(comments)
  })

  // POST /api/issues/:issueId/comments
  .post(
    '/issues/:issueId/comments',
    validator('json', (value, c) => {
      const body = value as { body?: string; parentId?: string }
      if (!body.body?.trim()) {
        return c.json({ error: 'Body is required' }, 400)
      }
      return { body: body.body.trim(), parentId: body.parentId || null }
    }),
    async (c) => {
      const session = c.get('session')
      const userId = c.get('user').id
      const orgId = session.activeOrganizationId

      if (!orgId) {
        return c.json({ error: 'No active organization' }, 400)
      }

      const { issueId } = c.req.param()
      const { body, parentId } = c.req.valid('json')

      // Verify issue belongs to the user's org
      const foundIssue = await db.query.issue.findFirst({
        where: and(eq(issue.id, issueId), isNull(issue.deletedAt)),
        with: { team: { columns: { organizationId: true } } },
      })

      if (!foundIssue || foundIssue.team.organizationId !== orgId) {
        return c.json({ error: 'Issue not found' }, 404)
      }

      // If parentId, verify the parent belongs to the same issue
      if (parentId) {
        const parentComment = await db.query.comment.findFirst({
          where: and(eq(comment.id, parentId), eq(comment.issueId, issueId)),
        })
        if (!parentComment) {
          return c.json({ error: 'Parent comment not found' }, 404)
        }
      }

      const id = crypto.randomUUID()

      await db.insert(comment).values({
        id,
        body,
        issueId,
        authorId: userId,
        parentId,
      })

      return c.json({ id }, 201)
    },
  )

  // PATCH /api/comments/:commentId
  .patch(
    '/comments/:commentId',
    validator('json', (value, c) => {
      const body = value as { body?: string }
      if (!body.body?.trim()) {
        return c.json({ error: 'Body is required' }, 400)
      }
      return { body: body.body.trim() }
    }),
    async (c) => {
      const userId = c.get('user').id
      const { commentId } = c.req.param()
      const { body } = c.req.valid('json')

      const found = await db.query.comment.findFirst({
        where: and(eq(comment.id, commentId), isNull(comment.deletedAt)),
      })

      if (!found) {
        return c.json({ error: 'Comment not found' }, 404)
      }

      if (found.authorId !== userId) {
        return c.json({ error: 'Forbidden' }, 403)
      }

      await db.update(comment).set({ body }).where(eq(comment.id, commentId))

      return c.json({ success: true })
    },
  )

  // DELETE /api/comments/:commentId (soft delete)
  .delete('/comments/:commentId', async (c) => {
    const userId = c.get('user').id
    const { commentId } = c.req.param()

    const found = await db.query.comment.findFirst({
      where: and(eq(comment.id, commentId), isNull(comment.deletedAt)),
    })

    if (!found) {
      return c.json({ error: 'Comment not found' }, 404)
    }

    if (found.authorId !== userId) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await db.update(comment).set({ deletedAt: new Date() }).where(eq(comment.id, commentId))

    return c.json({ success: true })
  })
