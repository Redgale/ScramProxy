import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};