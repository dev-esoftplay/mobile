import AsyncStorage from '@react-native-async-storage/async-storage';
import * as R from 'react';
import { fastFilter, fastLoop } from './fast';
const isEqual = require('react-fast-compare');

export interface UseCache_return<T> {
  useCache: () => [T, (newCache: T | ((oldCache: T) => T)) => void, () => void],
  get: () => T,
  set: (newCache: T | ((oldCache: T) => T)) => void
}

export interface UseCache_options {
  persistKey?: string,
  listener?: (data: any) => void
}
export default (() => {
  let useCacheIdx = 0
  let useCacheSubscriber = []
  let value = []
  return <T>(initValue: T, o?: UseCache_options): UseCache_return<T> => {
    const _idx = useCacheIdx
    if (!useCacheSubscriber[_idx]) {
      useCacheSubscriber[_idx] = [];
    }
    value[_idx] = initValue
    // rehidryte instant
    if (o?.persistKey) {
      AsyncStorage.getItem(o.persistKey).then((p) => {
        if (p)
          set(JSON.parse(p))
      })
    }

    function set(ns: T | ((x: T) => T)) {
      let isChange = false
      if (!isEqual(value[_idx], ns)) {
        isChange = true
      }
      if (isChange) {
        value[_idx] = ns instanceof Function ? ns(value[_idx]) : ns
        fastLoop(useCacheSubscriber[_idx], (c: any) => c?.(value[_idx]))
        if (o?.persistKey) {
          AsyncStorage.setItem(o.persistKey, JSON.stringify(value[_idx]))
        }
        if (o?.listener) {
          o?.listener?.(ns instanceof Function ? ns(value[_idx]) : ns)
        }
      }
    };

    function del() {
      if (o?.persistKey) {
        AsyncStorage.removeItem(o.persistKey)
      }
      set(initValue)
    }


    function subscribe(sl: any) {
      R.useEffect(() => {
        useCacheSubscriber[_idx].push(sl);
        return () => {
          useCacheSubscriber[_idx] = fastFilter(useCacheSubscriber[_idx], (f) => f !== sl)
        };
      }, [sl]);
    }


    function useCache(): [T, (newCache: T | ((oldCache: T) => T)) => void, () => void] {
      let l = R.useRef<T>(value[_idx]).current;

      const sl = (ns: T | ((oldCache: T) => T)) => {
        l = ns instanceof Function ? ns(l) : ns
      }

      subscribe(sl)

      return [l, set, del];
    };
    useCacheIdx++
    return { useCache, get: () => value[_idx], set: set };
  }
})()