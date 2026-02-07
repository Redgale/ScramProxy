import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Store active tabs in memory (in production, use Redis)
const activeTabs = new Map();

// Create new tab
router.post('/tabs', (req, res) => {
  const tabId = uuidv4();
  const tab = {
    id: tabId,
    title: 'New Tab',
    url: 'about:blank',
    favicon: '',
    cloaked: false,
    cloakMode: 'none', // none, about-blank, blob
    createdAt: new Date(),
    history: []
  };
  
  activeTabs.set(tabId, tab);
  logger.info(`Tab created: ${tabId}`);
  
  res.json({ 
    success: true, 
    tab: tab 
  });
});

// Get all tabs
router.get('/tabs', (req, res) => {
  const tabs = Array.from(activeTabs.values());
  res.json({ tabs });
});

// Get specific tab
router.get('/tabs/:tabId', (req, res) => {
  const { tabId } = req.params;
  const tab = activeTabs.get(tabId);
  
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found' });
  }
  
  res.json({ tab });
});

// Update tab
router.put('/tabs/:tabId', (req, res) => {
  const { tabId } = req.params;
  const { title, url, favicon, cloakMode } = req.body;
  
  const tab = activeTabs.get(tabId);
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found' });
  }
  
  if (title) tab.title = title;
  if (url) {
    tab.history.push(tab.url);
    tab.url = url;
  }
  if (favicon) tab.favicon = favicon;
  if (cloakMode) tab.cloakMode = cloakMode;
  
  res.json({ success: true, tab });
});

// Close tab
router.delete('/tabs/:tabId', (req, res) => {
  const { tabId } = req.params;
  
  if (!activeTabs.has(tabId)) {
    return res.status(404).json({ error: 'Tab not found' });
  }
  
  activeTabs.delete(tabId);
  logger.info(`Tab closed: ${tabId}`);
  
  res.json({ success: true });
});

// Tab history
router.get('/tabs/:tabId/history', (req, res) => {
  const { tabId } = req.params;
  const tab = activeTabs.get(tabId);
  
  if (!tab) {
    return res.status(404).json({ error: 'Tab not found' });
  }
  
  res.json({ history: tab.history });
});

export default router;