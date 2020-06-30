import * as R from 'react'
import { AsyncStorage } from 'react-native';

type SubscriberFunc<T> = (newState: T) => void;

export interface UseGlobal_return<T> {
  useState: () => [T, (newState: T) => void, () => void],
  get: () => T,
  set: (x: T) => void
}

export interface UseGlobal_options {
  persistKey?: string
}

export default function useGlobalState<T>(iv: T, o?: UseGlobal_options): UseGlobal_return<T> {
  let sb: SubscriberFunc<T>[] = [];
  let v: T = iv;
  let set = (ns: T | ((prev: T) => T), ac?: (ns: T) => any, ca?: (ns: T) => any) => {
    // @ts-ignore
    v = (v instanceof Function ? ns(v) : ns) as T;
    ca && ca(v);
    setTimeout(() => {
      sb.forEach((c: any) => c !== ca && c(v));
      ac && ac(v);
      if (o?.persistKey) {
        AsyncStorage.setItem(o.persistKey, JSON.stringify(v))
      }
    });
  };

  let useState = (): [T, (newState: T) => void, () => void] => {
    let [l, sl] = R.useState<T>(v);

    function del() {
      if (o?.persistKey) {
        AsyncStorage.removeItem(o.persistKey)
        c(iv)
      }
    }

    R.useEffect(() => {
      if (o?.persistKey) {
        AsyncStorage.getItem(o.persistKey).then((p) => {
          if (p)
            c(JSON.parse(p))
        })
      }
    }, [])

    R.useEffect(() => {
      sb.push(sl);
      return () => {
        sb = sb.filter((f) => f !== sl);
      };
    });
    let c = R.useCallback((ns) => set(ns, undefined, sl), [sl]);
    return [l, c, del];
  };

  return { useState, get: () => v, set: set };
}