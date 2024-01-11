import { MMKV } from 'react-native-mmkv';

const storage = new MMKV()

const FastStorage = {
  getItem(key: string): string | undefined {
    return storage.getString(key)
  },
  setItem(key: string, value: string) {
    storage.set(key, value)
  },
  async removeItem(key: string) {
    storage.delete(key)
  },
  clear(): void {
    storage.clearAll()
  },
};

export default FastStorage;
