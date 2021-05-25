import AsyncStorage from '@react-native-async-storage/async-storage'
import { _global } from 'esoftplay'

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
        all = JSON.parse(x).filter((x) => x != name)
      }
      AsyncStorage.setItem("user_data_dependent", JSON.stringify(all))
    })
  }

  deleteAll(): void {
    AsyncStorage.getItem("user_data_dependent").then((x) => {
      Object.values?.(_global.useGlobalUserDelete)?.map?.((func) => func?.())
      if (x) AsyncStorage.multiRemove(JSON.parse(x))
    })
  }
}