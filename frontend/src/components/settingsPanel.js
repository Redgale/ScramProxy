export class SettingsPanel {
  constructor() {
    this.panel = document.getElementById('settingsPanel');
    this.settings = this.loadSettings();
  }

  toggle() {
    this.panel.classList.toggle('hidden');
  }

  loadSettings() {
    const defaults = {
      enableJavaScript: true,
      blockAds: false,
      blockTrackers: false,
      cloakMode: 'none',
      enableCache: true,
      userAgent: ''
    };

    const saved = localStorage.getItem('proxySettings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  }

  async saveSettings() {
    const settings = {
      enableJavaScript: document.getElementById('enableJS').checked,
      blockAds: document.getElementById('blockAds').checked,
      blockTrackers: document.getElementById('blockTrackers').checked,
      cloakMode: document.querySelector('input[name="cloakMode"]:checked').value,
      enableCache: document.getElementById('enableCache').checked,
      userAgent: document.getElementById('userAgent').value
    };

    localStorage.setItem('proxySettings', JSON.stringify(settings));
    this.settings = settings;

    try {
      await fetch('/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      this.showNotification('Settings saved successfully');
      this.toggle();
    } catch (error) {
      this.showNotification('Failed to save settings', true);
    }
  }

  async resetSettings() {
    if (confirm('Reset all settings to defaults?')) {
      localStorage.removeItem('proxySettings');
      this.settings = this.loadSettings();
      this.updateUI();

      try {
        await fetch('/settings/reset', { method: 'POST' });
        this.showNotification('Settings reset to defaults');
      } catch (error) {
        this.showNotification('Failed to reset settings', true);
      }
    }
  }

  updateUI() {
    document.getElementById('enableJS').checked = this.settings.enableJavaScript;
    document.getElementById('blockAds').checked = this.settings.blockAds;
    document.getElementById('blockTrackers').checked = this.settings.blockTrackers;
    document.getElementById('enableCache').checked = this.settings.enableCache;
    document.getElementById('userAgent').value = this.settings.userAgent || '';
    
    const cloakRadio = document.querySelector(`input[name="cloakMode"][value="${this.settings.cloakMode}"]`);
    if (cloakRadio) cloakRadio.checked = true;
  }

  showNotification(message, isError = false) {
    // Simple notification (you can enhance this)
    console.log(isError ? `❌ ${message}` : `✅ ${message}`);
  }
}