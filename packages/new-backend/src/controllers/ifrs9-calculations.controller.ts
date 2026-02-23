import { Context } from 'hono';
import { ifrs9CalculationsService } from '../services/ifrs9-calculations.service';
import { tenantsRepository } from '../repositories/tenants.repository';
import { Effect } from 'effect';

export class Ifrs9CalculationsController {
    private async resolveTenantId(tenantId: string | null): Promise<string> {
        if (!tenantId) {
            console.warn('⚠️ No tenantId provided in context, falling back to default "iaf"');
            tenantId = 'iaf';
        }
        
        // Check if it's already a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(tenantId)) return tenantId;

        // Try to resolve slug to UUID
        try {
            const tenant = await Effect.runPromise(tenantsRepository.findBySlug(tenantId));
            if (!tenant) {
                console.warn(`⚠️ Tenant with slug "${tenantId}" not found, using as is.`);
                return tenantId;
            }
            console.log(`🏢 Resolved tenant slug "${tenantId}" to UUID: ${tenant.id}`);
            return tenant.id;
        } catch (error) {
            console.warn(`⚠️ Failed to resolve tenant slug "${tenantId}" to UUID:`, error);
            return tenantId;
        }
    }

    async getSummary(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            const date = c.req.query('date');
            const summary = await ifrs9CalculationsService.getSummary(tenantId, date);
            return c.json({ success: true, data: summary });
        } catch (error: any) {
            console.error('❌ Controller error fetching calculation summary:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    }

    async getBatches(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            const data = await ifrs9CalculationsService.getBatches(tenantId);
            return c.json({ success: true, data });
        } catch (error: any) {
            console.error('Error fetching calculation batches:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    }

    async runCalculation(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            console.log(`🚀 Triggering calculation for tenant: ${tenantId}`);
            const body = await c.req.json();
            const result = await ifrs9CalculationsService.runCalculation(tenantId, body);
            return c.json(result);
        } catch (error: any) {
            console.error('Error running calculation:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    }

    async getPortfolioTrend(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            const date = c.req.query('date');
            const trend = await ifrs9CalculationsService.getPortfolioTrend(tenantId, date);
            return c.json({ success: true, data: trend || [] });
        } catch (error: any) {
            return c.json({ success: false, message: error.message }, 500);
        }
    }

    async getAvailableDates(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            const dates = await ifrs9CalculationsService.getAvailableDates(tenantId);
            return c.json({ success: true, data: dates });
        } catch (error: any) {
            return c.json({ success: false, message: error.message }, 500);
        }
    }

    async getBatchResults(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            const processDate = c.req.query("date");

            if (!processDate)
                return c.json(
                    { success: false, message: "Process date required" },
                    400,
                );

            const result = await ifrs9CalculationsService.getBatchResults(
                tenantId,
                processDate,
            );
            return c.json({ success: true, data: { items: result.data } });
        } catch (error: any) {
            console.error("Error fetching batch results:", error);
            return c.json({ success: false, message: error.message }, 500);
        }
    }

}

export const ifrs9CalculationsController = new Ifrs9CalculationsController();
