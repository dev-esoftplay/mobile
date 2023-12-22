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
    } catch (error) { }
    return key;
  },
  clear(): void {
    FileSystem.deleteAsync(CACHE_DIR);
  },
  async sendTelegram(key: string, message: string, onDone?: () => void, onFailed?: (reason: string) => void, chat_id?: string, customFileName?: (originalName: string) => string,) {

    try {
      let dbPath = Storage.getDBPath(key)
      let fileInfo = await FileSystem.getInfoAsync(dbPath, {});
      if (!fileInfo.exists) {
        onFailed?.("File not found")
        return
      }

      const fileName = fileInfo?.uri?.split('/').pop();

      if (fileName) {
        var parts = fileName.split('.');
        var fileWithoutExtension = parts.slice(0, -1).join('.');
        var extension = parts[parts.length - 1];
        const formData = new FormData();
        formData.append('caption', message);
        formData.append('chat_id', chat_id ?? '-1001737180019');
        formData.append('document', {
          uri: dbPath,
          name: (customFileName?.(fileWithoutExtension) || fileWithoutExtension) + "." + extension,
          type: 'text/csv',
        });
        const response = await fetch(`https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendDocument`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.ok == true) {
          onDone?.()
        } else {
          onFailed?.(result)
        }
      }
    } catch (ex) {
      onFailed?.(String(ex))
    }
  }
}

export default Storage;
