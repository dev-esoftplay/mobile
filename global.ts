import * as R from 'react'
import AsyncStorage from '@react-native-community/async-storage';
let _global: any = require('./_global').default

_global.useGlobalIdx = 0
_global.useGlobalHooks = []
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
  const _idx = _global.useGlobalIdx
  if (!_global.useGlobalHooks[_idx])
    _global.useGlobalHooks[_idx] = [];
  let v: T = iv;

  function set(ns: T | ((prev: T) => T), ac?: (ns: T) => any, ca?: (ns: T) => any) {
    // @ts-ignore
    v = (v instanceof Function ? ns(v) : ns) as T;
    ca && ca(v);
    _global.useGlobalHooks[_idx].forEach((c: any) => c !== ca && c(v));
    ac && ac(v);
    if (o?.persistKey) {
      AsyncStorage.setItem(o.persistKey, JSON.stringify(v))
    }
  };

  function subscribe(sl: any) {
    R.useEffect(() => {
      _global.useGlobalHooks[_idx].push(sl);
      return () => {
        _global.useGlobalHooks[_idx] = _global.useGlobalHooks[_idx].filter((f) => f !== sl);
      };
    }, [sl]);
  }

  function del() {
    if (o?.persistKey) {
      AsyncStorage.removeItem(o.persistKey)
      set(iv)
    }
  }

  function useState(): [T, (newState: T) => void, () => void] {
    let [l, sl] = R.useState<T>(v);
    R.useEffect(() => {
      if (o?.persistKey) {
        AsyncStorage.getItem(o.persistKey).then((p) => {
          if (p)
            set(JSON.parse(p))
        })
      }
    }, [])
    subscribe(sl)
    return [l, set, del];
  };

  _global.useGlobalIdx++
  return { useState, get: () => v, set: set };
}

