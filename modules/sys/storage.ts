//noPage
import { Directory, File, Paths } from "expo-file-system";

const CACHE_DIR = new Directory(Paths.cache, "lib-storage-cache");

(async () => {
  try {
    if (!CACHE_DIR.exists) {
      CACHE_DIR.create();
    }
  } catch { }
})();

const Storage = {
  getDBPath(key: string): File {
    const name = key.replace(/\//g, "-") + ".txt";
    return new File(CACHE_DIR, name);
  },

  async getItem(key: string): Promise<any | null> {
    try {
      const file = this.getDBPath(key);

      if (!file.exists) return null;

      const value = await file.text();
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<string> {
    const file = this.getDBPath(key);

    await file.write(value);

    return value;
  },

  async removeItem(key: string): Promise<string> {
    try {
      const file = this.getDBPath(key);

      if (file.exists) {
        file.delete();
      }
    } catch { }

    return key;
  },

  clear(): void {
    try {
      if (CACHE_DIR.exists) {
        CACHE_DIR.delete();
      }
    } catch { }
  },

  async sendTelegram(
    key: string,
    message: string,
    onDone?: () => void,
    onFailed?: (reason: string) => void,
    chat_id?: string,
    customFileName?: (originalName: string) => string
  ) {
    try {
      const file = this.getDBPath(key);

      if (!file.exists) {
        onFailed?.("File not found");
        return;
      }

      const fileName = file.name;

      if (fileName) {
        const parts = fileName.split(".");
        const fileWithoutExtension = parts.slice(0, -1).join(".");
        const extension = parts[parts.length - 1];

        const formData = new FormData();
        formData.append("caption", message);
        formData.append("chat_id", chat_id ?? "-1001737180019");

        formData.append("document", {
          uri: file.uri,
          name:
            (customFileName?.(fileWithoutExtension) || fileWithoutExtension) +
            "." +
            extension,
          type: "text/csv",
        } as any);

        const response = await fetch(
          `https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendDocument`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (result.ok === true) {
          onDone?.();
        } else {
          onFailed?.(JSON.stringify(result));
        }
      }
    } catch (ex) {
      onFailed?.(String(ex));
    }
  },
};

export default Storage;