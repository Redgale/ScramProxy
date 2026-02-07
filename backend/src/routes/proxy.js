import express from 'express';
import { createProxyMiddleware, proxyHandler } from '../middleware/proxy.js';
import { sanitizeUrl } from '../utils/sanitizer.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const proxy = createProxyMiddleware();

// Main proxy endpoint
router.all('/:tabId/*', (req, res) => {
  const { tabId } = req.params;
  let targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ 
      error: 'Target URL is required',
      example: '/proxy/tab1?url=https://example.com'
    });
  }

  try {
    targetUrl = sanitizeUrl(targetUrl);
    logger.info(`Proxying ${tabId}: ${targetUrl}`);
    
    proxy.web(req, res, { target: targetUrl });
  } catch (error) {
    logger.error(`Proxy route error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Direct proxy endpoint (legacy)
router.post('/fetch', (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  proxy.web(req, res, { target: sanitizeUrl(url) });
});

export default router;