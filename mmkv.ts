
let storage: any;
let isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
if (isWeb) {
  storage = {
    getString(key: string) {
      return window.localStorage.getItem(key) || '';
    },
    set(key: string, value: string) {
      window.localStorage.setItem(key, value);
    },
    delete(key: string) {
      window.localStorage.removeItem(key);
    },
    clearAll() {
      window.localStorage.clear();
    }
  }
} else {
  // @ts-ignore
  const MMKV = require('react-native-mmkv').MMKV;
  storage = new MMKV();
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/mmkv.md) untuk melihat dokumentasi*/
const FastStorage = {
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/mmkv.md#getItemSync) untuk melihat dokumentasi*/
  getItemSync(key: string): string {
    return storage.getString(key)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/mmkv.md#getItem) untuk melihat dokumentasi*/
  getItem(key: string): Promise<string | undefined | null> {
    return new Promise((r) => r(storage.getString(key)))
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/mmkv.md#setItem) untuk melihat dokumentasi*/
  setItem(key: string, value: string) {
    storage.set(key, value)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/mmkv.md#removeItem) untuk melihat dokumentasi*/
  removeItem(key: string) {
    storage.delete(key)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/mmkv.md#clear) untuk melihat dokumentasi*/
  clear(): void {
    storage.clearAll();
  },
};

export default FastStorage;
