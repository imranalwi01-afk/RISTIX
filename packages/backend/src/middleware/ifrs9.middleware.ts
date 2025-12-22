// packages/backend/src/middleware/ifrs9.middleware.ts
export const validateIFRS9Request = (req: any, res: any, next: any) => {
  console.log('🧮 IFRS9 request validation');
  next();
};

export const ifrs9Middleware = {
  validateIFRS9Request
};

export default ifrs9Middleware;
