import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.cacheDirectory}lib-storage-cache/`;

(async () => {
  try {
    await FileSystem.makeDirectoryAsync(CACHE_DIR);
  } catch (e) {
    // do nothing
  }
})();

const Storage = {
  getDBPath(key: string): string {
    const path = `${CACHE_DIR}${key.replace(/\//g, "-")}.txt`;
    return path;
  },
  async getItem(key: string): Promise<string | null> {
    const path = this.getDBPath(key);
    try {
      const info = await FileSystem.getInfoAsync(path);
      const { exists } = info;
      if (exists) {
        const value = await FileSystem.readAsStringAsync(path, { encoding: 'utf8' });
        return JSON.parse(value);
      }
    } catch (error) {
      return null;
    }
    return null;
  },
  async setItem(key: string, value: string): Promise<string> {
    const path = this.getDBPath(key);
    await FileSystem.writeAsStringAsync(path, value, { encoding: 'utf8' });
    return value;
  },
  async removeItem(key: string): Promise<string> {
    const path = this.getDBPath(key);
    try {
      await FileSystem.deleteAsync(path);
    } catch (error) {}
    return key;
  },
  clear(): void {
    FileSystem.deleteAsync(CACHE_DIR);
  },
};

export default Storage;
