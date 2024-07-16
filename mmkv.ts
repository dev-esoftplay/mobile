import { MMKV } from 'react-native-mmkv';

const storage = new MMKV()

const FastStorage = {
  getItemSync(key: string): string {
    return storage.getString(key)
  },
  getItem(key: string): Promise<string | undefined | null> {
    return new Promise((r) => r(storage.getString(key)))
  },
  setItem(key: string, value: string) {
    storage.set(key, value)
  },
  removeItem(key: string) {
    storage.delete(key)
  },
  clear(): void {
    storage.clearAll()
  },
};

export default FastStorage;
