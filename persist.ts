import { useRef, useEffect, useState, useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fastFilter, fastLoop } from './fast'

export default (() => {
  let obj: any = {}
  let setter = {}
  return (key: string, def?: any): any[] => {
    const r = useRef(true)
    const [a, b] = useState(def)

    useMemo(() => { if (!setter[key]) setter[key] = [] }, [])

    function c(value: any) {
      if (r.current) {
        if (value != undefined)
          AsyncStorage.setItem(key, JSON.stringify(value));
        else
          d()
        fastLoop(setter[key], (cc) => cc(value))
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
      }, 100);
    }

    function d() {
      AsyncStorage.removeItem(key)
    }

    useEffect(() => {
      setter[key].push(b)
      e()
      return () => {
        r.current = false
        setter[key] = fastFilter(setter[key], (x) => x !== b);
      }
    }, [])

    return [a, c, e, d]
  }
})()