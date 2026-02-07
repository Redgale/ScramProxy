export class Cloaking {
  static getCloakMode() {
    const settings = localStorage.getItem('proxySettings');
    if (settings) {
      return JSON.parse(settings).cloakMode || 'none';
    }
    return 'none';
  }

  static applyAboutBlankCloak() {
    history.replaceState({}, 'about:blank', 'about:blank');
    document.title = 'about:blank';
  }

  static applyBlobCloak() {
    const blob = new Blob([''], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    history.replaceState({}, 'blob:', blobUrl);
  }

  static spoof(title = 'Google', favicon = 'https://www.google.com/favicon.ico') {
    document.title = title;
    
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
  }

  static removeFrameInfo() {
    // Try to hide iframe information
    try {
      Object.defineProperty(window, 'frameElement', {
        get: function() { return null; }
      });
    } catch (e) {
      // Silently fail if not allowed
    }
  }
}