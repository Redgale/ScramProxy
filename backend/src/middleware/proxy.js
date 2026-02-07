import httpProxy from 'http-proxy';
import { logger } from '../utils/logger.js';

export const createProxyMiddleware = () => {
  const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    followRedirects: true,
    ws: true
  });

  proxy.on('error', (err, req, res) => {
    logger.error(`Proxy error: ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Gateway', details: err.message }));
  });

  proxy.on('proxyRes', (proxyRes, req, res) => {
    // Add security headers
    proxyRes.headers['X-Powered-By'] = 'Scramjet Proxy';
    proxyRes.headers['X-Frame-Options'] = 'SAMEORIGIN';
    
    // Handle CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
  });

  return proxy;
};

export const proxyHandler = (proxy) => {
  return (req, res) => {
    const targetUrl = req.query.url || req.body.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'Target URL required' });
    }

    try {
      proxy.web(req, res, { target: targetUrl });
    } catch (error) {
      logger.error(`Proxy handler error: ${error.message}`);
      res.status(500).json({ error: 'Proxy failed' });
    }
  };
};