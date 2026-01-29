import { Context } from 'hono';
import { ifrs9CalculationsService } from '../services/ifrs9-calculations.service';

export class Ifrs9CalculationsController {
    
    async getSummary(c: Context) {
        try {
            const user = c.get('user');
            // if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);
            
            const data = await ifrs9CalculationsService.getSummary(user?.tenantId || 'default');
            return c.json({ success: true, data });
        } catch (error: any) {
            console.error('Error fetching calculation summary:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    }

    async getBatches(c: Context) {
        try {
            const user = c.get('user');
            const data = await ifrs9CalculationsService.getBatches(user?.tenantId || 'default');
            return c.json({ success: true, data });
        } catch (error: any) {
            console.error('Error fetching calculation batches:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    }

    async runCalculation(c: Context) {
        try {
            const user = c.get('user');
            const body = await c.req.json();
            const result = await ifrs9CalculationsService.runCalculation(user?.tenantId || 'default', body);
            return c.json(result);
        } catch (error: any) {
            console.error('Error running calculation:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    }

    async getPortfolioTrend(c: Context) {
        try {
            const user = c.get('user');
            const data = await ifrs9CalculationsService.getPortfolioTrend(user?.tenantId || 'default');
            return c.json({ success: true, data });
        } catch (error: any) {
            console.error('Error fetching portfolio trend:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    }
}

export const ifrs9CalculationsController = new Ifrs9CalculationsController();
