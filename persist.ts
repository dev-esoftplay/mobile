import { useRef, useEffect, useState, useMemo } from 'react'
import AsyncStorage from '@react-native-community/async-storage'
import { useIsFocused } from '@react-navigation/native';

export default function usePersistState(key: string, def?: any): any[] {
  const r = useRef(true)
  const [a, b] = useState(def)
  const isFocused = useIsFocused()

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
    if (isFocused)
      AsyncStorage.getItem(key).then((x) => {
        if (x) {
          c(JSON.parse(x))
        } else {
          c(def)
        }
      })
  }, [isFocused])

  useEffect(() => {
    return () => { r.current = false }
  }, [])

  return [a, c, e, d]
};