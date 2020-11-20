import * as R from 'react'
import AsyncStorage from '@react-native-community/async-storage';
let _global: any = require('./_global').default
const isEqual = require('react-fast-compare');

_global.useGlobalIdx = 0
_global.useGlobalSubscriber = []

export interface UseGlobal_return<T> {
  useState: () => [T, (newState: T) => void, () => void],
  get: () => T,
  set: (x: T) => void,
  reset: () => void,
  useSelector: (selector: (state: T) => any) => any;
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
    let isChange = false
    if (o?.listener && !isEqual(value, ns)) {
      isChange = true
    }
    value = ns
    _global.useGlobalSubscriber[_idx].forEach((c: any) => c?.(value));
    if (o?.persistKey) {
      AsyncStorage.setItem(o.persistKey, JSON.stringify(value))
    }
    if (isChange)
      o.listener(ns)
  };

  // function connect<T>(state: UseGlobal_return<T>): (cls: any) => void {
  //   const [x] = state.useState()
  //   return (cls: any) => {
  //     const CLS = cls
  //     (<CLS {...x} />)
  //   }
  // }

  function del() {
    if (o?.persistKey) {
      AsyncStorage.removeItem(o.persistKey)
    }
    set(initValue)
  }

  function useSelector(se: (state: T) => any): void {
    let [l, s] = R.useState<any>(se(value));

    let sl = R.useCallback(
      (ns: T) => {
        let n = se(ns);
        !isEqual(l, n) && s(n);
      },
      [l]
    );

    subscribe(sl)

    return l;
  }

  function subscribe(func: any) {
    R.useEffect(() => {
      _global.useGlobalSubscriber[_idx].push(func);
      return () => {
        _global.useGlobalSubscriber[_idx] = _global.useGlobalSubscriber[_idx].filter((f) => f !== func);
      };
    }, [func]);
  }

  function get(param?: string, ...params: string[]): any {
    let out: any = value;
    if (param) {
      var _params = [param, ...params]
      if (_params.length > 0)
        for (let i = 0; i < _params.length; i++) {
          const key = _params[i];
          if (out.hasOwnProperty(key)) {
            out = out[key];
          } else {
            out = {};
          }
        }
    }
    return out;
  }


  function useState(): [T, (newState: T) => void, () => void] {
    let [l, sl] = R.useState<T>(value);

    subscribe(sl)

    return [l, set, del];
  };

  _global.useGlobalIdx++
  return { useState, get, set, useSelector, reset: del };
}