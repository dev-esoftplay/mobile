import * as R from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
const _global = require('./_global')
const isEqual = require('react-fast-compare');
const UserData = require('./modules/user/data').default

export interface useGlobalReturn<T> {
  useState: () => [T, (newState: T) => void, () => void],
  get: () => T,
  set: (x: T) => void,
  reset: () => void,
  connect: (props: useGlobalConnect<T>) => any,
  useSelector: (selector: (state: T) => any) => any;
}

export interface useGlobalOption {
  persistKey?: string,
  listener?: (data: any) => void,
  isUserData?: boolean
}

export interface useGlobalConnect<T> {
  render: (props: T) => any,
}

export default (() => {
  let subscriber = []
  _global.useGlobalIdx = 0
  _global.useGlobalUserDelete = {}
  return <T>(initValue: T, o?: useGlobalOption): useGlobalReturn<T> => {
    const _idx = _global.useGlobalIdx
    if (!subscriber[_idx])
      subscriber[_idx] = [];
    let value: T = initValue;

    // rehidryte instant
    if (o?.persistKey) {
      AsyncStorage.getItem(o.persistKey).then((p) => {
        if (p)
          set(JSON.parse(p))
      })
    }

    /* register to userData to automatically reset state and persist */
    if (o?.isUserData) {
      function resetFunction() {
        set(initValue)
      }
      if (o?.persistKey) {
        UserData.register(o?.persistKey)
      }
      _global.useGlobalUserDelete[_idx] = resetFunction
    }

    function set(ns: T) {
      let isChange = false
      if (o?.listener && !isEqual(value, ns)) {
        isChange = true
      }
      value = ns
      subscriber?.[_idx]?.forEach?.((c: any) => c?.(value));
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
        subscriber[_idx].push(func);
        return () => {
          subscriber[_idx] = subscriber?.[_idx]?.filter?.((f) => f !== func);
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
            if (out?.hasOwnProperty?.(key)) {
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

    function _connect(props: useGlobalConnect<T>): any {
      const [state] = useState()
      const children = props.render(state)
      return children ? R.cloneElement(children) : null
    }

    _global.useGlobalIdx++
    return { useState, get, set, useSelector, reset: del, connect: _connect };
  }
})()
