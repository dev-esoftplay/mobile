// noPage
// withObject
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userDataReset } from 'esoftplay/global';
import FastStorage from 'esoftplay/mmkv';
import Storage from 'esoftplay/storage';

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/data.md) untuk melihat dokumentasi*/
export default {
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/data.md#register) untuk melihat dokumentasi*/
  register(name: string): void {
    AsyncStorage.getItem("user_data_dependent").then((x) => {
      let all: string[] = []
      if (x) {
        all = JSON.parse(x).filter((x) => x != name)
      }
      all.push(name)
      AsyncStorage.setItem("user_data_dependent", JSON.stringify(all))
    })
  },
  unregister(name: string): void {
    AsyncStorage.getItem("user_data_dependent").then((x) => {
      let all = []
      if (x) {
        all = JSON.parse(x).filter((x) => x != name)
      }
      AsyncStorage.setItem("user_data_dependent", JSON.stringify(all))
    })
  },
  deleteAll(): void {
    AsyncStorage.getItem("user_data_dependent").then((x) => {
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