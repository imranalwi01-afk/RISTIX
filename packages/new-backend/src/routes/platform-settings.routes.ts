import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { getDatabase } from '@/config/database'
import { platformEmailTemplates, platformSettings } from '@/db/schema'
import type { AppContext } from '@/app'
import { buildErrorResponse } from '@/lib/http/error-response'

const platformDb = getDatabase(null)

export const platformSettingsRoutes = new OpenAPIHono<AppContext>()

// GET /platform/settings/public - Get public branding settings (no auth required)
platformSettingsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/public',
        tags: ['Platform Settings'],
        summary: 'Get public platform settings (branding)',
        responses: { 200: { description: 'Public settings' } },
    }),
    async (c) => {
        try {
            const [branding] = await platformDb.select().from(platformSettings)
                .where(eq(platformSettings.key, 'branding')).limit(1)
            return c.json({
                success: true,
                data: {
                    platformName: (branding?.value as any)?.platformName ?? null,
                    logoUrl: (branding?.value as any)?.logoUrl ?? null,
                },
            })
        } catch (error) {
            console.warn('Failed to fetch public settings (table may not exist):', error instanceof Error ? error.message : error)
            return c.json({
                success: true,
                data: {
                    platformName: null,
                    logoUrl: null,
                },
            })
        }
    }
)

// GET /platform/settings/templates - List email templates
platformSettingsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/templates',
        tags: ['Platform Settings'],
        summary: 'List email templates',
        responses: { 200: { description: 'Email templates list' } },
    }),
    async (c) => {
        try {
            const templates = await platformDb.select().from(platformEmailTemplates).orderBy(platformEmailTemplates.code)
            return c.json({ success: true, data: templates })
        } catch (error) {
            return c.json(buildErrorResponse(c, { error: 'Failed to fetch email templates' }), 500)
        }
    }
)

// PUT /platform/settings/templates/:code - Update email template by code
const emailTemplateSchema = z.object({
    subject: z.string().min(1).max(255),
    bodyHtml: z.string().min(1),
    bodyText: z.string().min(1),
    availableVariables: z.array(z.string()).optional(),
})

platformSettingsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/templates/{code}',
        tags: ['Platform Settings'],
        summary: 'Update email template by code',
        request: {
            params: z.object({ code: z.string() }),
            body: { content: { 'application/json': { schema: emailTemplateSchema } } },
        },
        responses: { 200: { description: 'Email template updated' } },
    }),
    async (c) => {
        try {
            const { code } = c.req.valid('param')
            const body = c.req.valid('json')
            const [existing] = await platformDb.select().from(platformEmailTemplates)
                .where(eq(platformEmailTemplates.code, code)).limit(1)
            if (!existing) {
                return c.json(buildErrorResponse(c, { error: 'Email template not found' }), 404)
            }
            const [updated] = await platformDb.update(platformEmailTemplates)
                .set({ ...body, updatedAt: new Date() })
                .where(eq(platformEmailTemplates.code, code))
                .returning()
            return c.json({ success: true, data: updated })
        } catch (error) {
            return c.json(buildErrorResponse(c, { error: 'Failed to update email template' }), 500)
        }
    }
)

// GET /platform/settings/smtp - Get SMTP configuration
platformSettingsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/smtp',
        tags: ['Platform Settings'],
        summary: 'Get SMTP configuration',
        responses: { 200: { description: 'SMTP config' } },
    }),
    async (c) => {
        try {
            const [setting] = await platformDb.select().from(platformSettings)
                .where(eq(platformSettings.key, 'smtp')).limit(1)
            return c.json({ success: true, data: setting?.value ?? null })
        } catch (error) {
            return c.json(buildErrorResponse(c, { error: 'Failed to fetch SMTP settings' }), 500)
        }
    }
)

const smtpConfigSchema = z.object({
    host: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    secure: z.boolean(),
    user: z.string(),
    pass: z.string(),
    fromEmail: z.string().email(),
    fromName: z.string(),
})

// PUT /platform/settings/smtp - Update SMTP configuration
platformSettingsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/smtp',
        tags: ['Platform Settings'],
        summary: 'Update SMTP configuration',
        request: {
            body: { content: { 'application/json': { schema: smtpConfigSchema } } },
        },
        responses: { 200: { description: 'SMTP config updated' } },
    }),
    async (c) => {
        try {
            const body = c.req.valid('json')
            const [existing] = await platformDb.select().from(platformSettings)
                .where(eq(platformSettings.key, 'smtp')).limit(1)
            if (existing) {
                const [updated] = await platformDb.update(platformSettings)
                    .set({ value: body, updatedAt: new Date() })
                    .where(eq(platformSettings.key, 'smtp'))
                    .returning()
                return c.json({ success: true, data: updated })
            } else {
                const [created] = await platformDb.insert(platformSettings)
                    .values({ key: 'smtp', value: body, description: 'SMTP email configuration' })
                    .returning()
                return c.json({ success: true, data: created })
            }
        } catch (error) {
            return c.json(buildErrorResponse(c, { error: 'Failed to save SMTP settings' }), 500)
        }
    }
)

// POST /platform/settings/smtp/test - Test SMTP connection
const smtpTestSchema = smtpConfigSchema.extend({
    testEmail: z.string().email().optional(),
})

platformSettingsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/smtp/test',
        tags: ['Platform Settings'],
        summary: 'Test SMTP connection',
        request: {
            body: { content: { 'application/json': { schema: smtpTestSchema } } },
        },
        responses: { 200: { description: 'Test result' } },
    }),
    async (c) => {
        try {
            const body = c.req.valid('json')
            // Attempt real SMTP connection test using nodemailer
            let transporter
            try {
                const nodemailer = await import('nodemailer')
                transporter = nodemailer.default.createTransport({
                    host: body.host,
                    port: body.port,
                    secure: body.secure,
                    auth: body.user ? { user: body.user, pass: body.pass } : undefined,
                })
                await transporter.verify()
            } catch (err: any) {
                return c.json({ success: false, error: err.message || 'SMTP connection test failed' }, 400)
            }
            return c.json({ success: true, message: 'SMTP connection successful' })
        } catch (error) {
            return c.json(buildErrorResponse(c, { error: 'Failed to test SMTP connection' }), 500)
        }
    }
)
