import { Context } from 'hono';
import { forecastService } from '../services/forecast.service';
import { buildErrorResponse } from '../lib/http/error-response';

export class ForecastController {

    // Get historical and available forecast scenarios
    async getForecasts(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json(buildErrorResponse(c, { error: 'Unauthorized', message: 'Unauthorized', code: 'UNAUTHORIZED' }), 401);

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
            if (!user?.tenantId) return c.json(buildErrorResponse(c, { error: 'Unauthorized', message: 'Unauthorized', code: 'UNAUTHORIZED' }), 401);

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
        return c.json(
            buildErrorResponse(c, {
                error: 'System Error: ' + error.message,
                message: 'System Error: ' + error.message,
                code: 'FORECAST_ERROR',
            }),
            500
        );
    }
}

export const forecastController = new ForecastController();
