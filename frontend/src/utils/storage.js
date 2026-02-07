export class StorageManager {
  saveState(state) {
    try {
      localStorage.setItem('proxyState', JSON.stringify(state));
    } catch (error) {
      console.warn('Could not save state:', error);
    }
  }

  getState() {
    try {
      const state = localStorage.getItem('proxyState');
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.warn('Could not retrieve state:', error);
      return null;
    }
  }

  clearState() {
    try {
      localStorage.removeItem('proxyState');
    } catch (error) {
      console.warn('Could not clear state:', error);
    }
  }
}