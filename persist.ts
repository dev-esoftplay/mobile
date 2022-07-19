import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { fastFilter, fastLoop } from './fast';

export default (() => {
  let obj: any = {}
  let setter = {}
  return (key: string, def?: any): any[] => {
    const r = useRef(true)
    const [state, setState] = useState(def)

    useMemo(() => { if (!setter[key]) setter[key] = [] }, [])

    function set(value: any) {
      if (r.current) {
        if (value != undefined)
          AsyncStorage.setItem(key, JSON.stringify(value));
        else
          del()
        fastLoop(setter[key], (cc) => cc(value))
      }
    }

    function updater(callback?: (a?: typeof def) => void) {
      if (obj[key]) {
        clearTimeout(obj[key])
        delete obj[key]
      }
      obj[key] = setTimeout(() => {
        if (r.current)
          AsyncStorage.getItem(key).then((x) => {
            delete obj[key]
            if (x) {
              const xx = JSON.parse(x)
              if (callback) callback(xx)
              set(xx)
            } else {
              if (callback) callback(def)
              set(def)
            }
          })
      }, 100);
    }

    function del() {
      AsyncStorage.removeItem(key)
    }

    useLayoutEffect(() => {
      setter[key].push(setState)
      updater()
      return () => {
        r.current = false
        setter[key] = fastFilter(setter[key], (x) => x !== setState);
      }
    }, [])

    return [state, set, updater, del]
  }
})()