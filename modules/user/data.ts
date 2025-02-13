// noPage
// withObject
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userDataReset } from 'esoftplay/global';
import FastStorage from 'esoftplay/mmkv';
import Storage from 'esoftplay/storage';

(() => {
  AsyncStorage.getItem("user_data_dependent").then((keys) => {
    if (keys) {
      FastStorage.setItem("user_data_dependent", keys)
      AsyncStorage.removeItem("user_data_dependent")
    }
  })
})()

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/data.md) untuk melihat dokumentasi*/
export default {
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/data.md#register) untuk melihat dokumentasi*/
  register(name: string): void {
    const x = FastStorage.getItemSync("user_data_dependent")
    let all: string[] = []
    if (x) {
      all = JSON.parse(x).filter((x) => x != name)
    }
    all.push(name)
    FastStorage.setItem("user_data_dependent", JSON.stringify(all))
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/data.md#multiRegister) untuk melihat dokumentasi*/
  async multiRegister(names: string[]): Promise<void> {
    try {
      const data = await FastStorage.getItem("user_data_dependent");
      const all = data ? JSON.parse(data) : [];

      const uniqueNames = names.filter((name) => !all.includes(name));
      const updatedAll = [...all, ...uniqueNames];

      await FastStorage.setItem("user_data_dependent", JSON.stringify(updatedAll));
    } catch (error) {
      console.error("Error registering multiple names:", error);
    }
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/data.md#unregister) untuk melihat dokumentasi*/
  unregister(name: string): void {
    FastStorage.getItem("user_data_dependent").then((x) => {
      let all = []
      if (x) {
        all = JSON.parse(x).filter((x) => x != name)
      }
      FastStorage.setItem("user_data_dependent", JSON.stringify(all))
    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/data.md#deleteAll) untuk melihat dokumentasi*/
  deleteAll(): void {
    FastStorage.getItem("user_data_dependent").then((x) => {
      if (x) {
        userDataReset.forEach((f) => f())
        const arx = JSON.parse(x)
        AsyncStorage.multiRemove(arx)
        arx.forEach((ix) => { FastStorage.removeItem(ix) })
        arx.forEach((ix) => { Storage.removeItem(ix) })
        AsyncStorage.removeItem("user_data_dependent")
      }
    })
  }
}