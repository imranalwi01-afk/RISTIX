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
        console.error('Failed to fetch public platform settings:', error)
        return c.json(
            { success: false, error: 'Failed to fetch public settings' },
            500
        )
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
platformSettingsRoutes.put('/:key', authMiddleware, async (c: any, next: any) => {
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
}, async (c) => {
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
