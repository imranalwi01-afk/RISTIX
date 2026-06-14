import { Hono } from 'hono'
import { db } from '../config/database'
import { platformSettings } from '../db/schema'
import { eq } from 'drizzle-orm'
import { authMiddleware } from '../middleware'

const platformSettingsRoutes = new Hono()

/**
 * @openapi
 * /api/platform/settings/public:
 *   get:
 *     tags: [Platform Settings]
 *     summary: Get public platform settings (e.g., branding)
 *     description: Retrieves non-sensitive platform settings like logos and themes for the login screen.
 *     responses:
 *       200:
 *         description: Success
 */
platformSettingsRoutes.get('/public', async (c) => {
    try {
        const brandingSetting = await db.query.platformSettings.findFirst({
            where: eq(platformSettings.key, 'branding'),
        })

        if (!brandingSetting) {
            return c.json({
                success: true,
                data: {
                    logoUrl: null,
                    platformName: null,
                },
            })
        }

        return c.json({
            success: true,
            data: brandingSetting.value,
        })
    } catch (error) {
        const errorCode = (error as any)?.code
        const errorMessage = String((error as any)?.message || '')

        if (errorCode === '42P01' || errorMessage.includes('does not exist')) {
            return c.json({
                success: true,
                data: {
                    logoUrl: null,
                    platformName: null,
                },
            })
        }

        console.error('Failed to fetch public platform settings:', error)
        return c.json({ success: false, error: 'Failed to fetch public settings' }, 500)
    }
})

/**
 * @openapi
 * /api/platform/settings/{key}:
 *   put:
 *     tags: [Platform Settings]
 *     summary: Update a specific platform setting
 *     description: Updates a key-value setting in the platform configuration. Requires SUPER ADMIN.
 *     security:
 *       - BearerAuth: []
 */
const requirePlatformAdmin = async (c: any, next: any) => {
    const permissions = ((c.get('permissions') as string[]) || []).filter((item): item is string => typeof item === 'string')
    const canManagePlatformSettings =
        Boolean(c.get('isSystemUser')) ||
        permissions.includes('admin.super_admin') ||
        permissions.includes('PLATFORM_SUPER_ADMIN') ||
        permissions.includes('PLATFORM_ADMIN') ||
        permissions.includes('admin.system.manage')

    if (!canManagePlatformSettings) {
        return c.json(
            {
                success: false,
                error: 'Forbidden: platform admin access required',
                code: 'FORBIDDEN',
            },
            403
        )
    }

    await next()
}

/**
 * @openapi
 * /api/platform/settings/smtp/test:
 *   post:
 *     tags: [Platform Settings]
 *     summary: Test SMTP configuration
 *     description: Tests the provided SMTP credentials without saving them. Requires SUPER ADMIN.
 *     security:
 *       - BearerAuth: []
 */
platformSettingsRoutes.post('/smtp/test', authMiddleware, requirePlatformAdmin, async (c) => {
    try {
        const body = await c.req.json()
        const { testSmtpConnection } = await import('../services/notification.service')
        
        const success = await testSmtpConnection(body)
        if (success) {
            return c.json({ success: true, message: 'SMTP connection successful' })
        } else {
            return c.json({ success: false, error: 'SMTP connection failed' }, 400)
        }
    } catch (error: any) {
        console.error('SMTP Test Failed:', error)
        return c.json({ success: false, error: error.message || 'SMTP connection failed' }, 500)
    }
})

/**
 * @openapi
 * /api/platform/settings/templates:
 *   get:
 *     tags: [Platform Settings]
 *     summary: Get all email templates
 *     description: Retrieves all dynamic email templates. Requires SUPER ADMIN.
 *     security:
 *       - BearerAuth: []
 */
platformSettingsRoutes.get('/templates', authMiddleware, requirePlatformAdmin, async (c) => {
    try {
        const { platformEmailTemplates } = await import('../db/schema/platform.schema');
        const templates = await db
            .select()
            .from(platformEmailTemplates)
            .orderBy(platformEmailTemplates.code);

        return c.json({
            success: true,
            data: templates,
        })
    } catch (error) {
        console.error('Failed to fetch platform email templates:', error)
        return c.json({ success: false, error: 'Failed to fetch templates' }, 500)
    }
})

/**
 * @openapi
 * /api/platform/settings/templates/{code}:
 *   put:
 *     tags: [Platform Settings]
 *     summary: Update an email template
 *     description: Updates or creates an email template. Requires SUPER ADMIN.
 *     security:
 *       - BearerAuth: []
 */
platformSettingsRoutes.put('/templates/:code', authMiddleware, requirePlatformAdmin, async (c) => {
    try {
        const code = c.req.param('code')
        const body = await c.req.json()
        const { platformEmailTemplates } = await import('../db/schema/platform.schema');

        const [existing] = await db
            .select()
            .from(platformEmailTemplates)
            .where(eq(platformEmailTemplates.code, code))
            .limit(1)

        let updatedTemplate;

        if (existing) {
            [updatedTemplate] = await db
                .update(platformEmailTemplates)
                .set({
                    subject: body.subject,
                    bodyHtml: body.bodyHtml,
                    bodyText: body.bodyText,
                    availableVariables: body.availableVariables || existing.availableVariables,
                    updatedAt: new Date(),
                })
                .where(eq(platformEmailTemplates.code, code))
                .returning()
        } else {
            [updatedTemplate] = await db
                .insert(platformEmailTemplates)
                .values({
                    code,
                    subject: body.subject,
                    bodyHtml: body.bodyHtml,
                    bodyText: body.bodyText,
                    availableVariables: body.availableVariables || [],
                })
                .returning()
        }

        return c.json({
            success: true,
            data: updatedTemplate,
        })
    } catch (error) {
        console.error('Failed to update platform email template:', error)
        return c.json({ success: false, error: 'Failed to update template' }, 500)
    }
})

/**
 * @openapi
 * /api/platform/settings/{key}:
 *   get:
 *     tags: [Platform Settings]
 *     summary: Get a specific platform setting
 *     description: Retrieves a key-value setting. Requires SUPER ADMIN.
 *     security:
 *       - BearerAuth: []
 */
platformSettingsRoutes.get('/:key', authMiddleware, requirePlatformAdmin, async (c) => {
    try {
        const key = c.req.param('key')
        const [setting] = await db
            .select()
            .from(platformSettings)
            .where(eq(platformSettings.key, key))
            .limit(1)

        return c.json({
            success: true,
            data: setting ? setting.value : null,
        })
    } catch (error) {
        console.error('Failed to fetch platform setting:', error)
        return c.json({ success: false, error: 'Failed to fetch setting' }, 500)
    }
})

/**
 * @openapi
 * /api/platform/settings/{key}:
 *   put:
 *     tags: [Platform Settings]
 *     summary: Update a specific platform setting
 *     description: Updates a key-value setting in the platform configuration. Requires SUPER ADMIN.
 *     security:
 *       - BearerAuth: []
 */
platformSettingsRoutes.put('/:key', authMiddleware, requirePlatformAdmin, async (c) => {
    try {
        const key = c.req.param('key')
        const body = await c.req.json()

        const [existing] = await db
            .select()
            .from(platformSettings)
            .where(eq(platformSettings.key, key))
            .limit(1)

        let updatedSetting;

        if (existing) {
            [updatedSetting] = await db
                .update(platformSettings)
                .set({
                    value: body,
                    updatedAt: new Date(),
                })
                .where(eq(platformSettings.key, key))
                .returning()
        } else {
            [updatedSetting] = await db
                .insert(platformSettings)
                .values({
                    key,
                    value: body,
                    description: `Auto-generated setting for ${key}`,
                })
                .returning()
        }

        return c.json({
            success: true,
            data: updatedSetting,
        })
    } catch (error) {
        console.error('Failed to update platform setting:', error)
        return c.json(
            { success: false, error: 'Failed to update setting' },
            500
        )
    }
})

export { platformSettingsRoutes }
