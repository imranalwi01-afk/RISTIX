import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: [
        'src/services/roles-api.utils.test.ts',
        'src/services/users-api.utils.test.ts',
        'src/components/maintenance/access-management.utils.test.ts',
        'src/lib/validation/collective-config.validation.test.ts',
        'src/features/individual-impairment/routing.test.ts',
        'src/services/api/individual-impairment-v2-client.test.ts',
        'src/features/approval/domain/approval.models.test.ts',
        'src/features/shared/query/query-keys.test.ts',
      ],
    globals: true,
  },
});
