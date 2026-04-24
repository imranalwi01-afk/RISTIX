import { Context } from 'hono';
import { ifrs9CalculationsService } from '../services/ifrs9-calculations.service';
import { tenantsRepository } from '../repositories/tenants.repository';
import { Effect } from 'effect';
import { internalError, badRequest } from '../lib/http/route-errors';

export class Ifrs9CalculationsController {
    private handleError(c: Context, error: unknown): Response {
        const message = error instanceof Error ? error.message : 'IFRS 9 calculation request failed';
        return internalError(c, message, 'IFRS9_CALCULATION_ERROR');
    }

    private async resolveTenantId(tenantId: string | null): Promise<string> {
        if (!tenantId) {
            console.warn('⚠️ No tenantId provided in context, falling back to default "iaf"');
            tenantId = 'iaf';
        }

        // Check if it's already a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(tenantId)) return tenantId;

        if (tenantId === 'iaf') {
            return 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
        }

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
            const mode = c.req.query('mode');
            const summary = await ifrs9CalculationsService.getSummary(tenantId, date, mode);
            return c.json({ success: true, data: summary.data, meta: { debug: summary.debug } });
        } catch (error: any) {
            console.error('❌ Controller error fetching calculation summary:', error);
            return this.handleError(c, error);
        }
    }

    async getBatches(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            const mode = c.req.query('mode');
            const data = await ifrs9CalculationsService.getBatches(tenantId, mode);
            return c.json({ success: true, data });
        } catch (error: any) {
            console.error('Error fetching calculation batches:', error);
            return this.handleError(c, error);
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
            return this.handleError(c, error);
        }
    }

    async runPreviewCalculation(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            console.log(`🚀 Triggering preview calculation for tenant: ${tenantId}`);
            const body = await c.req.json();
            const result = await ifrs9CalculationsService.runPreviewCalculation(tenantId, body);
            return c.json(result);
        } catch (error: any) {
            console.error('Error running preview calculation:', error);
            return this.handleError(c, error);
        }
    }

    async getPortfolioTrend(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            const date = c.req.query('date');
            const mode = c.req.query('mode');
            const trend = await ifrs9CalculationsService.getPortfolioTrend(tenantId, date, mode);
            return c.json({ success: true, data: trend.data || [], meta: { debug: trend.debug } });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async getAvailableDates(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            const mode = c.req.query('mode');
            const groupBy = c.req.query('groupBy');
            const dates = await ifrs9CalculationsService.getAvailableDates(tenantId, mode, groupBy);
            return c.json({ success: true, data: dates });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async getBatchResults(c: Context) {
        try {
            const rawTenantId = c.get('tenantId');
            const tenantId = await this.resolveTenantId(rawTenantId);
            const processDate = c.req.query("date");
            const mode = c.req.query("mode");

            if (!processDate)
                return badRequest(c, 'Process date required');

            const result = await ifrs9CalculationsService.getBatchResults(
                tenantId,
                processDate,
                mode
            );
            return c.json({ success: true, data: { items: result.data } });
        } catch (error: any) {
            console.error("Error fetching batch results:", error);
            return this.handleError(c, error);
        }
    }

}

export const ifrs9CalculationsController = new Ifrs9CalculationsController();
