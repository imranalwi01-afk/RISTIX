// packages/r-analytics/src/middleware/rate-limiter.js
// Rate limiting middleware for R API service

const { RateLimiterMemory } = require('rate-limiter-flexible');

// Configure rate limiters for different endpoints
const generalLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 // Block for 60 seconds if limit exceeded
});

const calculationLimiter = new RateLimiterMemory({
  keyPrefix: 'calculation',
  points: 10, // Number of calculation requests
  duration: 60, // Per 60 seconds
  blockDuration: 120 // Block for 2 minutes if limit exceeded
});

const heavyCalculationLimiter = new RateLimiterMemory({
  keyPrefix: 'heavy_calculation',
  points: 3, // Number of heavy calculation requests
  duration: 300, // Per 5 minutes
  blockDuration: 600 // Block for 10 minutes if limit exceeded
});

// General rate limiter middleware
const rateLimiterMiddleware = async (req, res, next) => {
  try {
    // Determine which limiter to use based on route
    let limiter = generalLimiter;
    
    if (req.path.includes('/ecl/calculate')) {
      limiter = calculationLimiter;
    } else if (req.path.includes('/ecl/batch') || req.path.includes('/models/train')) {
      limiter = heavyCalculationLimiter;
    }
    
    // Get client identifier (IP address or user ID)
    const key = req.ip || req.connection.remoteAddress;
    
    // Check rate limit
    await limiter.consume(key);
    
    next();
    
  } catch (rejRes) {
    // Rate limit exceeded
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: {
        message: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retry_after_seconds: secs,
        timestamp: new Date().toISOString()
      }
    });
  }
};

module.exports = rateLimiterMiddleware;
