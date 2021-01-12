import { useRef, useEffect, useState, useMemo } from 'react'
import AsyncStorage from '@react-native-community/async-storage'
const _global = require('./_global')

let obj: any = {}
export default function usePersistState(key: string, def?: any): any[] {
  const r = useRef(true)
  const [a, b] = useState(def)

  function c(value: any) {
    if (r.current) {
      if (value != undefined) AsyncStorage.setItem(key, JSON.stringify(value)); else d()
      _global.usePersistState_Setter[key].forEach(cc => {
        cc(value)
      })
    }
  }

  function e(callback?: (a?: typeof def) => void) {
    if (obj[key]) {
      clearTimeout(obj[key])
      debounce()
    } else
      debounce()
    function debounce() {
      obj[key] = setTimeout(() => {
        if (r.current)
          AsyncStorage.getItem(key).then((x) => {
            delete obj[key]
            if (x) {
              if (callback) callback(JSON.parse(x))
              c(JSON.parse(x))
            } else {
              if (callback) callback(def)
              c(def)
            }
          })
      }, 100);
    }
  }

  function d() {
    AsyncStorage.removeItem(key)
  }

  useMemo(() => {
    if (!_global.usePersistState_Setter) {
      _global.usePersistState_Setter = {}
    }
    if (!_global.usePersistState_Setter[key])
      _global.usePersistState_Setter[key] = []
    _global.usePersistState_Setter[key].push(b)
    e()
  }, [])

  useEffect(() => {
    return () => {
      r.current = false
      _global.usePersistState_Setter[key] = _global.usePersistState_Setter[key].filter((x) => x !== b)
    }
  }, [])

  return [a, c, e, d]
};