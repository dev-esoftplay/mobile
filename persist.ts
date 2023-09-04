import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLayoutEffect, useState } from 'react';


let setter = new Set<Function>()
export default function usePersistState(key: string, def?: any): any[] {
  const [state, setState] = useState(def || undefined)

  function set(value: any) {
    if (value == undefined)
      AsyncStorage.removeItem(key)
    else
      AsyncStorage.setItem(key, JSON.stringify(value));
    setter.forEach((c) => c?.(value))
  }

  function updater(callback?: (a?: typeof def) => void) {
    AsyncStorage.getItem(key).then((v: string | undefined) => {
      if (v) {
        const json = JSON.parse(v)
        if (callback) callback(json)
        set(json)
      } else {
        if (callback) callback(def)
        set(def)
      }
    })
  }

  function del() {
    AsyncStorage.removeItem(key)
  }

  useLayoutEffect(() => {
    setter.add(setState)
    updater()
    return () => {
      setter.delete(setState)
    }
  }, [])

  return [state, set, updater, del]
}
