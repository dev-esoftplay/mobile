// withHooks

import * as FileSystem from 'expo-file-system';
export interface LibStorageArgs {

}
export interface LibStorageProps {

}
const CACHE_DIR = `${FileSystem.cacheDirectory}lib-storage-cache/`;

(() => {
  try {
    FileSystem.makeDirectoryAsync(CACHE_DIR).then().catch(e => { });
  } catch (e) {
    // do nothing
  }
})()

export default class Storage {
  constructor() {
    this.getDBPath = this.getDBPath.bind(this);
    this.setItem = this.setItem.bind(this);
    this.getItem = this.getItem.bind(this)
    this.removeItem = this.removeItem.bind(this);
    this.clear = this.clear.bind(this);
  }

  private getDBPath(key: string): string {
    const path = `${CACHE_DIR}${key.replace(/\//g, "-")}.txt`;
    return path
  }

  getItem(key: string): Promise<string | null> {
    return new Promise(async (r, j) => {
      const path = this.getDBPath(key)
      FileSystem.getInfoAsync(path).then((info) => {
        if (info.exists) {
          FileSystem.readAsStringAsync(path, { encoding: 'utf8' }).then((value) => {
            r(JSON.parse(value))
          }).catch((c) => {
            r(c)
          })
        } else {
          r(null)
        }
      })
    })
  }

  setItem(key: string, value: string): Promise<string> {
    return new Promise(async (r, j) => {
      const path = this.getDBPath(key)
      FileSystem.writeAsStringAsync(path, value, { encoding: 'utf8' })
    })
  }

  removeItem(key: string): Promise<string> {
    return new Promise(async (r, j) => {
      const path = this.getDBPath(key)
      try { FileSystem.deleteAsync(path) } catch (error) { }
    })
  }

  clear(): void {
    FileSystem.deleteAsync(CACHE_DIR)
  }
}