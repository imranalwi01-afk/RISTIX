export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerOTel } = await import('@vercel/otel');
    registerOTel({
      serviceName: 'ifrs9-frontend',
      attributes: {
        'deployment.environment': process.env.NODE_ENV || 'development',
      },
    });
  }
}
