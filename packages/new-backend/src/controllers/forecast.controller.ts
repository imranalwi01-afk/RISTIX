import { Context } from 'hono';
import { forecastService } from '../services/forecast.service';

export class ForecastController {

    // Get historical and available forecast scenarios
    async getForecasts(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const limit = Number(c.req.query('limit')) || 50;
            const offset = Number(c.req.query('offset')) || 0;

            const data = await forecastService.getForecasts(user.tenantId, { limit, offset });

            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // Trigger a new forecast run
    async triggerForecast(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const body = await c.req.json();

            // In a real application, this might queue a job for the R engine
            const data = await forecastService.triggerForecast(user.tenantId, body);

            return c.json({ success: true, message: "Forecast job initiated", data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    private handleError(c: Context, error: any) {
        console.error('Forecast Controller Error:', error.message);
        return c.json({ success: false, message: 'System Error: ' + error.message }, 500);
    }
}

export const forecastController = new ForecastController();
