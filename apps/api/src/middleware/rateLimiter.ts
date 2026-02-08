import { Request, Response, NextFunction } from 'express';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export const rateLimiter = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `rate-limit:${identifier}:${req.path}`;
      
      const currentCount = await redis.incr(key);
      
      if (currentCount === 1) {
        await redis.expire(key, Math.ceil(options.windowMs / 1000));
      }
      
      const ttl = await redis.ttl(key);
      
      res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - currentCount).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());
      
      if (currentCount > options.maxRequests) {
        return res.status(429).json({
          error: options.message || 'Too many requests, please try again later',
          retryAfter: ttl,
        });
      }
      
      return next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // Fail open - don't block requests if rate limiter fails
      return next();
    }
  };
};

// Preset rate limiters
export const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later',
});

export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
});

export const uploadLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Too many file uploads, please try again later',
});
