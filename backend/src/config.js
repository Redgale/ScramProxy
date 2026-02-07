import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Proxy settings
  proxy: {
    timeout: parseInt(process.env.PROXY_TIMEOUT || '30000'),
    retries: parseInt(process.env.PROXY_RETRIES || '3'),
    cacheSize: parseInt(process.env.CACHE_SIZE || '100')
  },
  
  // Security
  security: {
    rateLimit: parseInt(process.env.RATE_LIMIT || '100'),
    requireAuth: process.env.REQUIRE_AUTH === 'true',
    apiKey: process.env.API_KEY || null
  },
  
  // CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  },
  
  // Features
  features: {
    tabCloaking: process.env.TAB_CLOAKING !== 'false',
    customHeaders: process.env.CUSTOM_HEADERS !== 'false',
    ipRotation: process.env.IP_ROTATION === 'true'
  }
};