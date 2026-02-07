export class TabManager {
  constructor() {
    this.tabs = new Map();
    this.activeTabId = null;
  }

  addTab(tab) {
    this.tabs.set(tab.id, tab);
    this.renderTabs();
    this.renderTabContent(tab.id);
  }

  removeTab(tabId) {
    this.tabs.delete(tabId);
    this.renderTabs();
    
    const contentArea = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (contentArea) contentArea.remove();
  }

  selectTab(tabId) {
    this.activeTabId = tabId;
    this.renderTabs();
    this.showTabContent(tabId);
  }

  updateTabTitle(tabId, title) {
    const tab = this.tabs.get(tabId);
    if (tab) {
      tab.title = title;
      this.renderTabs();
    }
  }

  getTabs() {
    return Array.from(this.tabs.values());
  }

  renderTabs() {
    const tabsList = document.getElementById('tabsList');
    tabsList.innerHTML = '';

    this.tabs.forEach((tab, tabId) => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab ${tabId === this.activeTabId ? 'active' : ''}`;
      tabEl.innerHTML = `
        <span class="tab-title">${this.escapeHtml(tab.title)}</span>
        <button class="tab-close" data-tab-id="${tabId}">✕</button>
      `;

      tabEl.addEventListener('click', (e) => {
        if (!e.target.closest('.tab-close')) {
          window.app.selectTab(tabId);
        }
      });

      tabEl.querySelector('.tab-close').addEventListener('click', () => {
        window.app.closeTab(tabId);
      });

      tabsList.appendChild(tabEl);
    });
  }

  renderTabContent(tabId) {
    const tabsContent = document.getElementById('tabsContent');
    const contentDiv = document.createElement('div');
    contentDiv.className = 'tab-content';
    contentDiv.setAttribute('data-tab-id', tabId);

    const iframe = document.createElement('iframe');
    iframe.className = 'tab-frame';
    iframe.setAttribute('data-tab-id', tabId);
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups');

    // Welcome screen
    contentDiv.innerHTML = `
      <div class="welcome-screen">
        <div class="welcome-icon">🌐</div>
        <div class="welcome-title">Enter a URL to get started</div>
        <div class="welcome-subtitle">Type a website address above or search for anything</div>
      </div>
    `;

    tabsContent.appendChild(contentDiv);
  }

  showTabContent(tabId) {
    const allContent = document.querySelectorAll('.tab-content');
    allContent.forEach(content => {
      content.classList.remove('active');
    });

    const activeContent = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}