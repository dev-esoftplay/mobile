// MMKV web shim using localStorage
const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const storage = {
  getString(key) {
    if (isWeb) return window.localStorage.getItem(key) || '';
    return '';
  },
  set(key, value) {
    if (isWeb) window.localStorage.setItem(key, value);
  },
  delete(key) {
    if (isWeb) window.localStorage.removeItem(key);
  }
};

const FastStorage = {
  getItemSync(key) {
    return storage.getString(key);
  },
  getItem(key) {
    return Promise.resolve(storage.getString(key));
  },
  setItem(key, value) {
    storage.set(key, value);
  },
  removeItem(key) {
    storage.delete(key);
  }
};

export default FastStorage;
