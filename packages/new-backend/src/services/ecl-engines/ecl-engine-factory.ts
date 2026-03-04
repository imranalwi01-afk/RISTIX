
import { IEclEngine } from './types';
import { REclEngine } from './r-ecl-engine';
import { TSEclEngine } from './ts-ecl-engine';
import { env } from '../../config/env';

export class EclEngineFactory {
    static getEngine(): IEclEngine {
        // We can use an environment variable to select the engine
        // Default to R_ANALYTICS for now as it's the current working integration
        const engineType = (process.env.ECL_ENGINE_TYPE || 'R_ANALYTICS').toUpperCase();

        switch (engineType) {
            case 'TYPESCRIPT':
            case 'TS':
                return new TSEclEngine();
            case 'R_ANALYTICS':
            case 'R':
            default:
                return new REclEngine();
        }
    }
}
