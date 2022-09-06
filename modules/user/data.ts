// noPage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { _global } from 'esoftplay';
import { fastFilter } from './../../fast';

export default class m {
  static register(name: string): void {
    AsyncStorage.getItem("user_data_dependent").then((x) => {
      let all = []
      if (x) {
        all = [...JSON.parse(x), name]
      } else {
        all.push(name)
      }
      AsyncStorage.setItem("user_data_dependent", JSON.stringify(all))
    })
  }
  static unregister(name: string): void {
    AsyncStorage.getItem("user_data_dependent").then((x) => {
      let all = []
      if (x) {
        all = fastFilter(JSON.parse(x), (x) => x != name)
      }
      AsyncStorage.setItem("user_data_dependent", JSON.stringify(all))
    })
  }

  deleteAll(): void {
    AsyncStorage.getItem("user_data_dependent").then((x) => {
      if (_global?.useGlobalUserDelete) {
        Object.values?.(_global?.useGlobalUserDelete)?.map?.((func) => func?.())
      }
      if (x) AsyncStorage.multiRemove(JSON.parse(x))
    })
  }
}