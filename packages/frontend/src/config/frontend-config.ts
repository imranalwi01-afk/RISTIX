// packages/frontend/src/config/frontend-config.ts
// Compatibility shim for legacy imports.

import { frontendEnvironmentLoader } from './environment-loader-frontend';

export const FrontendConfigService = frontendEnvironmentLoader;
export const appConfig = frontendEnvironmentLoader.getConfiguration();
