import { useRef, useEffect, useState, useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
const _global = require('./_global')

let obj: any = {}
if (!_global.usePersistState_Setter) {
  _global.usePersistState_Setter = {}
}

export default function usePersistState(key: string, def?: any): any[] {
  const r = useRef(true)
  const [a, b] = useState(def)

  useMemo(() => { if (!_global.usePersistState_Setter[key]) _global.usePersistState_Setter[key] = [] }, [])

  function c(value: any) {
    if (r.current) {
      if (value != undefined)
        AsyncStorage.setItem(key, JSON.stringify(value));
      else
        d()
      _global.usePersistState_Setter[key].forEach(cc => cc(value))
    }
  }

  function e(callback?: (a?: typeof def) => void) {
    if (obj[key]) {
      clearTimeout(obj[key])
    }
    obj[key] = setTimeout(() => {
      if (r.current)
        AsyncStorage.getItem(key).then((x) => {
          delete obj[key]
          if (x) {
            const xx = JSON.parse(x)
            if (callback) callback(xx)
            c(xx)
          } else {
            if (callback) callback(def)
            c(def)
          }
        })
    }, 50);
  }

  function d() {
    AsyncStorage.removeItem(key)
  }

  useEffect(() => {
    _global.usePersistState_Setter[key].push(b)
    e()
    return () => {
      r.current = false
      _global.usePersistState_Setter[key] = _global.usePersistState_Setter[key].filter((x) => x !== b)
    }
  }, [])

  return [a, c, e, d]
};