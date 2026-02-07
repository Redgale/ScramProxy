import { TabManager } from './components/tabManager.js';
import { SettingsPanel } from './components/settingsPanel.js';
import { StorageManager } from './utils/storage.js';
import { Cloaking } from './utils/cloaking.js';

class ScramjetProxy {
  constructor() {
    this.tabManager = new TabManager();
    this.settingsPanel = new SettingsPanel();
    this.storage = new StorageManager();
    this.cloaking = new Cloaking();
    this.activeTabId = null;
    
    this.initializeEventListeners();
    this.loadSavedState();
  }

  initializeEventListeners() {
    // New tab button
    document.getElementById('newTabBtn').addEventListener('click', () => this.createNewTab());

    // Go button
    document.getElementById('goBtn').addEventListener('click', () => this.navigateToUrl());
    document.getElementById('urlInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.navigateToUrl();
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.settingsPanel.toggle();
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
      this.settingsPanel.toggle();
    });

    // Settings save/reset
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      this.settingsPanel.saveSettings();
    });

    document.getElementById('resetSettingsBtn').addEventListener('click', () => {
      this.settingsPanel.resetSettings();
    });
  }

  async createNewTab() {
    try {
      const response = await fetch('/api/tabs', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        this.activeTabId = data.tab.id;
        this.tabManager.addTab(data.tab);
        this.selectTab(data.tab.id);
        this.updateStatus(`Tab created`);
      }
    } catch (error) {
      console.error('Error creating tab:', error);
      this.updateStatus(`Error creating tab`, true);
    }
  }

  async selectTab(tabId) {
    this.activeTabId = tabId;
    this.tabManager.selectTab(tabId);
    
    try {
      const response = await fetch(`/api/tabs/${tabId}`);
      const data = await response.json();
      if (data.tab) {
        document.getElementById('urlInput').value = data.tab.url !== 'about:blank' ? data.tab.url : '';
      }
    } catch (error) {
      console.error('Error fetching tab:', error);
    }
  }

  async navigateToUrl() {
    const urlInput = document.getElementById('urlInput');
    let url = urlInput.value.trim();

    if (!url) {
      this.updateStatus('Please enter a URL', true);
      return;
    }

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      this.updateStatus('Invalid URL', true);
      return;
    }

    if (!this.activeTabId) {
      await this.createNewTab();
    }

    await this.loadUrlInTab(this.activeTabId, url);
  }

  async loadUrlInTab(tabId, url) {
    this.updateStatus(`Loading ${new URL(url).hostname}...`);

    try {
      const response = await fetch(`/api/tabs/${tabId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          title: new URL(url).hostname
        })
      });

      if (!response.ok) throw new Error('Failed to update tab');

      const data = await response.json();
      this.tabManager.updateTabTitle(tabId, data.tab.title);

      // Create iframe for the proxied content
      const frame = document.querySelector(`iframe[data-tab-id="${tabId}"]`);
      if (frame) {
        frame.src = `/proxy/${tabId}?url=${encodeURIComponent(url)}`;
      }

      this.updateStatus(`Loaded ${new URL(url).hostname}`);
    } catch (error) {
      console.error('Error loading URL:', error);
      this.updateStatus(`Failed to load page`, true);
    }
  }

  async closeTab(tabId) {
    try {
      await fetch(`/api/tabs/${tabId}`, { method: 'DELETE' });
      this.tabManager.removeTab(tabId);
      
      if (this.activeTabId === tabId) {
        const remainingTabs = this.tabManager.getTabs();
        if (remainingTabs.length > 0) {
          this.selectTab(remainingTabs[0].id);
        } else {
          this.activeTabId = null;
        }
      }
      
      this.updateStatus('Tab closed');
    } catch (error) {
      console.error('Error closing tab:', error);
    }
  }

  updateStatus(message, isError = false) {
    const statusText = document.getElementById('statusText');
    statusText.textContent = message;
    statusText.style.color = isError ? 'var(--danger)' : 'var(--text-secondary)';
  }

  loadSavedState() {
    const savedState = this.storage.getState();
    if (savedState && savedState.tabs && savedState.tabs.length > 0) {
      savedState.tabs.forEach(tab => {
        this.tabManager.addTab(tab);
      });
      this.selectTab(savedState.tabs[0].id);
    } else {
      this.createNewTab();
    }
  }

  saveState() {
    this.storage.saveState({
      tabs: this.tabManager.getTabs(),
      activeTabId: this.activeTabId
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ScramjetProxy();
  
  // Save state periodically
  setInterval(() => {
    window.app.saveState();
  }, 5000);
});