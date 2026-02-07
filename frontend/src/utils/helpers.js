export const urlHelpers = {
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },

  normalizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  },

  getHostname(url) {
    try {
      return new URL(url).hostname;
    } catch (_) {
      return url;
    }
  },

  getSearchUrl(query) {
    // Use Google Search
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
};

export const domHelpers = {
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  createElement(tag, className = '', innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }
};