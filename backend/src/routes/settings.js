import express from 'express';

const router = express.Router();

// Default settings
let proxySettings = {
  enableJavaScript: true,
  blockAds: false,
  blockTrackers: false,
  customUserAgent: '',
  enableCaching: true,
  cacheExpiry: 3600,
  proxyHeaders: {
    'X-Forwarded-For': true,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  tabCloaking: {
    enabled: true,
    defaultMode: 'none'
  }
};

// Get settings
router.get('/', (req, res) => {
  res.json(proxySettings);
});

// Update settings
router.put('/', (req, res) => {
  const { enableJavaScript, blockAds, blockTrackers, customUserAgent, tabCloaking } = req.body;
  
  if (enableJavaScript !== undefined) proxySettings.enableJavaScript = enableJavaScript;
  if (blockAds !== undefined) proxySettings.blockAds = blockAds;
  if (blockTrackers !== undefined) proxySettings.blockTrackers = blockTrackers;
  if (customUserAgent) proxySettings.customUserAgent = customUserAgent;
  if (tabCloaking) proxySettings.tabCloaking = { ...proxySettings.tabCloaking, ...tabCloaking };
  
  res.json({ success: true, settings: proxySettings });
});

// Reset to defaults
router.post('/reset', (req, res) => {
  proxySettings = {
    enableJavaScript: true,
    blockAds: false,
    blockTrackers: false,
    customUserAgent: '',
    enableCaching: true,
    cacheExpiry: 3600,
    proxyHeaders: {
      'X-Forwarded-For': true,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    tabCloaking: {
      enabled: true,
      defaultMode: 'none'
    }
  };
  
  res.json({ success: true, settings: proxySettings });
});

export default router;