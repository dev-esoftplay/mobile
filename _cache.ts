import * as R from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
const isEqual = require('react-fast-compare');

export interface UseCache_return<T> {
  useCache: () => [T, (newCache: T) => void, () => void],
  get: () => T,
  set: (x: T) => void
}

export interface UseCache_options {
  persistKey?: string,
  listener?: (data: any) => void
}
export default (() => {
  let useCacheIdx = 0
  let useCacheSubscriber = []
  let value
  return <T>(initValue: T, o?: UseCache_options): UseCache_return<T> => {
    const _idx = useCacheIdx
    if (!useCacheSubscriber[_idx]) {
      useCacheSubscriber[_idx] = [];
    }
    value = initValue
    // rehidryte instant
    if (o?.persistKey) {
      AsyncStorage.getItem(o.persistKey).then((p) => {
        if (p)
          set(JSON.parse(p))
      })
    }

    function set(ns: T) {
      let isChange = false
      if (o?.listener && !isEqual(value, ns)) {
        isChange = true
      }
      value = ns
      useCacheSubscriber[_idx].forEach((c: any) => c?.(value));
      if (o?.persistKey) {
        AsyncStorage.setItem(o.persistKey, JSON.stringify(value))
      }
      if (isChange)
        o.listener(ns)
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
          useCacheSubscriber[_idx] = useCacheSubscriber[_idx].filter((f) => f !== sl);
        };
      }, [sl]);
    }


    function useCache(): [T, (newState: T) => void, () => void] {
      let l = R.useRef<T>(value).current;

      const sl = (newl: T) => { l = newl }
      
      subscribe(sl)
      
      return [l, set, del];
    };
    useCacheIdx++
    return { useCache, get: () => value, set: set };
  }
})() 