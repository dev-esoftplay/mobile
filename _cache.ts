import AsyncStorage from '@react-native-async-storage/async-storage';
import Storage from 'esoftplay/storage';
import * as R from 'react';
const isEqual = require('react-fast-compare');

export interface UseCache_return<T> {
  useCache: () => [T, (newCache: T | ((oldCache: T) => T)) => void, () => void],
  get: () => T,
  set: (newCache: T | ((oldCache: T) => T)) => void
}

export interface UseCache_options {
  persistKey?: string,
  inFile?: boolean,
  listener?: (data: any) => void
}
export default (() => {
  let useCacheIdx = 0
  let useCacheSubscriber: any[] = []
  return <T>(initValue: T, o?: UseCache_options): UseCache_return<T> => {
    const STORAGE = o?.inFile ? new Storage() : AsyncStorage
    const _idx = useCacheIdx
    if (!useCacheSubscriber[_idx]) {
      useCacheSubscriber[_idx] = [];
    }
    let value = initValue
    // rehidryte instant
    if (o?.persistKey) {
      STORAGE.getItem(o.persistKey).then((p) => {
        if (p)
          set(JSON.parse(p))
      })
    }

    function set(ns: T | ((x: T) => T)) {
      let isChange = false
      if (!isEqual(value, ns)) {
        isChange = true
      }
      if (isChange) {
        value = ns instanceof Function ? ns(value) : ns
        useCacheSubscriber[_idx].forEach((c: any) => c?.(value))
        if (o?.persistKey) {
          STORAGE.setItem(o.persistKey, JSON.stringify(value))
        }
        if (o?.listener) {
          o?.listener?.(ns instanceof Function ? ns(value) : ns)
        }
      }
    };

    function del() {
      if (o?.persistKey) {
        STORAGE.removeItem(o.persistKey)
      }
      set(initValue)
    }


    function subscribe(sl: any) {
      R.useEffect(() => {
        useCacheSubscriber[_idx].push(sl);
        return () => {
          useCacheSubscriber[_idx] = useCacheSubscriber[_idx].filter((f) => f !== sl);
        };
      }, [sl]);
    }


    function useCache(): [T, (newCache: T | ((oldCache: T) => T)) => void, () => void] {
      let l = R.useRef<T>(value).current;

      const sl = (ns: T | ((oldCache: T) => T)) => {
        l = ns instanceof Function ? ns(l) : ns
      }

      subscribe(sl)

      return [l, set, del];
    };
    useCacheIdx++
    return { useCache, get: () => value, set: set };
  }
})()