import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: 'ifrs9-frontend',
    attributes: {
      'deployment.environment': process.env.NODE_ENV || 'development',
    },
  });
}
