import { and, eq, isNull } from 'drizzle-orm'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { db } from '../db'
import { attachment, issue } from '../db/schema'
import { getPresignedUploadUrl, getPresignedDownloadUrl, deleteS3Object } from '../lib/s3'
import type { AuthVariables } from '../middleware/auth'

export const attachmentRoutes = new Hono<{ Variables: AuthVariables }>()
  // POST /api/issues/:issueId/attachments — request presigned upload URL + register metadata
  .post(
    '/issues/:issueId/attachments',
    validator('json', (value, c) => {
      const body = value as {
        fileName?: string
        fileSize?: number
        mimeType?: string
      }
      if (!body.fileName?.trim() || !body.fileSize || !body.mimeType?.trim()) {
        return c.json({ error: 'fileName, fileSize, and mimeType are required' }, 400)
      }
      return {
        fileName: body.fileName.trim(),
        fileSize: body.fileSize,
        mimeType: body.mimeType.trim(),
      }
    }),
    async (c) => {
      const session = c.get('session')
      const userId = c.get('user').id
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

      const { fileName, fileSize, mimeType } = c.req.valid('json')
      const attachmentId = crypto.randomUUID()
      const s3Key = `attachments/${issueId}/${attachmentId}/${fileName}`

      // Generate presigned upload URL
      let uploadUrl: string
      try {
        uploadUrl = await getPresignedUploadUrl(s3Key, mimeType)
      } catch (err) {
        console.error('[attachments] Failed to generate presigned URL:', err)
        return c.json({ error: 'Failed to generate upload URL. Check S3 configuration.' }, 500)
      }

      // Save attachment metadata in DB
      await db.insert(attachment).values({
        id: attachmentId,
        issueId,
        uploaderId: userId,
        fileName,
        fileSize,
        mimeType,
        s3Key,
      })

      return c.json({ id: attachmentId, uploadUrl }, 201)
    },
  )

  // GET /api/issues/:issueId/attachments — list attachments with download URLs
  .get('/issues/:issueId/attachments', async (c) => {
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

    const attachments = await db.query.attachment.findMany({
      where: and(eq(attachment.issueId, issueId), isNull(attachment.deletedAt)),
      with: {
        uploader: { columns: { id: true, name: true, image: true } },
      },
      orderBy: (a, { desc }) => [desc(a.createdAt)],
    })

    // Generate download URLs for each attachment
    try {
      const result = await Promise.all(
        attachments.map(async (a) => ({
          id: a.id,
          fileName: a.fileName,
          fileSize: a.fileSize,
          mimeType: a.mimeType,
          uploader: a.uploader,
          createdAt: a.createdAt,
          downloadUrl: await getPresignedDownloadUrl(a.s3Key),
        })),
      )
      return c.json(result)
    } catch (err) {
      console.error('[attachments] Failed to generate download URLs:', err)
      // Return attachments without download URLs rather than failing entirely
      const result = attachments.map((a) => ({
        id: a.id,
        fileName: a.fileName,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        uploader: a.uploader,
        createdAt: a.createdAt,
        downloadUrl: '',
      }))
      return c.json(result)
    }
  })

  // DELETE /api/attachments/:attachmentId — soft delete + remove from S3
  .delete('/attachments/:attachmentId', async (c) => {
    const session = c.get('session')
    const userId = c.get('user').id
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const { attachmentId } = c.req.param()

    const found = await db.query.attachment.findFirst({
      where: and(eq(attachment.id, attachmentId), isNull(attachment.deletedAt)),
      with: {
        issue: {
          with: { team: { columns: { organizationId: true } } },
        },
      },
    })

    if (!found || found.issue.team.organizationId !== orgId) {
      return c.json({ error: 'Attachment not found' }, 404)
    }

    // Only the uploader can delete
    if (found.uploaderId !== userId) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    // Delete from S3
    await deleteS3Object(found.s3Key)

    // Soft delete in DB
    await db
      .update(attachment)
      .set({ deletedAt: new Date() })
      .where(eq(attachment.id, attachmentId))

    return c.json({ success: true })
  })
