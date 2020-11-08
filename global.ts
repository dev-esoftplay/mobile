import * as R from 'react'
import AsyncStorage from '@react-native-community/async-storage';
let _global: any = require('./_global').default

_global.useGlobalIdx = 0
_global.useGlobalSubscriber = []
type SubscriberFunc<T> = (newState: T) => void;

export interface UseGlobal_return<T> {
  useState: () => [T, (newState: T) => void, () => void],
  get: () => T,
  set: (x: T) => void
}

export interface UseGlobal_options {
  persistKey?: string,
  listener?: (data: any) => void
}
export default function useGlobalState<T>(initValue: T, o?: UseGlobal_options): UseGlobal_return<T> {
  const _idx = _global.useGlobalIdx
  if (!_global.useGlobalSubscriber[_idx])
    _global.useGlobalSubscriber[_idx] = [];
  let value: T = initValue;

  // rehidryte instant
  if (o?.persistKey) {
    AsyncStorage.getItem(o.persistKey).then((p) => {
      if (p)
        set(JSON.parse(p))
    })
  }

  function set(ns: T) {
    value = ns
    _global.useGlobalSubscriber[_idx].forEach((c: any) => c?.(value));
    if (o?.persistKey) {
      AsyncStorage.setItem(o.persistKey, JSON.stringify(value))
    }
    if (o?.listener){
      o.listener(ns)
    }
  };

  function del() {
    if (o?.persistKey) {
      AsyncStorage.removeItem(o.persistKey)
      set(initValue)
    }
  }

  function useState(): [T, (newState: T) => void, () => void] {
    let [l, sl] = R.useState<T>(value);

    R.useEffect(() => {
      if (o?.persistKey) {
        AsyncStorage.getItem(o.persistKey).then((p) => {
          if (p)
            set(JSON.parse(p))
        })
      }
    }, [])

    R.useEffect(() => {
      _global.useGlobalSubscriber[_idx].push(sl);
      return () => {
        _global.useGlobalSubscriber[_idx] = _global.useGlobalSubscriber[_idx].filter((f) => f !== sl);
      };
    }, [sl]);

    return [l, set, del];
  };

  _global.useGlobalIdx++
  return { useState, get: () => value, set: set };
}