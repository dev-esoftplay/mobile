import { useRef, useEffect, useState, useMemo } from 'react'
import AsyncStorage from '@react-native-community/async-storage'

export default function usePersistState(key: string, def?: any): any[] {
  const r = useRef(false)
  const [a, b] = useState(def)

  function c(value: any) {
    if (r.current && value != undefined) {
      AsyncStorage.setItem(key, JSON.stringify(value))
      b(value)
    }
  }

  function e(callback?: (a?: typeof def) => void) {
    if (r.current)
      AsyncStorage.getItem(key).then((x) => {
        if (x) {
          if (callback) callback(JSON.parse(x))
          c(JSON.parse(x))
        } else {
          if (callback) callback(def)
          c(def)
        }
      })
  }

  function d() {
    AsyncStorage.removeItem(key)
  }

  useMemo(() => {
    AsyncStorage.getItem(key).then((x) => {
      if (x) {
        c(JSON.parse(x))
      } else {
        c(def)
      }
    })
  }, [])

  useEffect(() => {
    r.current = true
    return () => { r.current = false }
  }, [])

  return [a, c, e, d]
};