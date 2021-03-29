import { useRef, useEffect, useState, useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default (() => {
  let values: any = {}
  let setter = {}

  AsyncStorage.getAllKeys((err, keys) => {
    if (keys)
      AsyncStorage.multiGet(keys).then((s) => {
        values = s
      })
  })

  return (key: string, def?: any): any[] => {
    const r = useRef(true)
    const [a, b] = useState(values[key] ? JSON.parse(values[key]) : def)

    useMemo(() => {
      if (!setter[key])
        setter[key] = []
    }, [])

    function c(value: any) {
      if (r.current) {
        if (value != undefined)
          AsyncStorage.setItem(key, JSON.stringify(value));
        else
          d()
        values[key] = JSON.stringify(value)
        setter[key].forEach(cc => cc(value))
      }
    }

    function d() {
      AsyncStorage.removeItem(key)
    }

    function e(callback?: (a: typeof def) => void) {
      if (callback && values[key])
        callback(JSON.parse(values[key]))
    }

    useEffect(() => {
      setter[key].push(b)
      return () => {
        r.current = false
        setter[key] = setter[key].filter((x) => x !== b)
      }
    }, [])

    return [a, c, e, d]
  }
})()