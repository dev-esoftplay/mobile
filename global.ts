import * as R from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
const _global = require('./_global')
const isEqual = require('react-fast-compare');

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

_global.useGlobalUserDelete = {}
if (__DEV__) {
  if (!_global.__DEV_SUBCS__)
    _global.__DEV_SUBCS__ = {}
  if (!_global.__DEV_VLS__)
    _global.__DEV_VLS__ = {}
}

class Context {
  idx = 0
  increment = () => this.idx++
  reset = () => this.idx = 0
}

export const globalIdx = new Context()

const m = () => {
  let subscriber = {}
  function m<T>(initValue: T, o?: useGlobalOption): useGlobalReturn<T> {
    const _idx = globalIdx.idx
    if (!subscriber[_idx])
      subscriber[_idx] = [];

    if (__DEV__) { /* Fast refresh adaptor */
      if (!_global.__DEV_VLS__[_idx]) {
        _global.__DEV_VLS__[_idx] = initValue
      }
      if (!_global.__DEV_SUBCS__[_idx]) {
        _global.__DEV_SUBCS__[_idx] = []
      }
      subscriber[_idx] = _global.__DEV_SUBCS__[_idx]
    }

    let value: T = __DEV__ ? _global.__DEV_VLS__[_idx] : initValue;

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
        const UserData = require('./modules/user/data').default
        UserData.register(o?.persistKey)
      }
      _global.useGlobalUserDelete[_idx] = resetFunction
    }

    function set(ns: T) {
      const isChange = !isEqual(value, ns)
      if (__DEV__)
        _global.__DEV_VLS__[_idx] = ns
      value = ns
      subscriber?.[_idx]?.forEach?.((c: any) => c?.(ns));
      if (o?.persistKey) {
        AsyncStorage.setItem(o.persistKey, JSON.stringify(ns))
      }
      if (isChange) {
        if (o?.listener)
          o.listener(ns)
      }
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
        if (__DEV__)
          _global.__DEV_SUBCS__[_idx].push(func)
        return () => {
          // console.log('DICALL', subscriber?.[_idx]?.length)
          subscriber[_idx] = subscriber?.[_idx]?.filter?.((f) => f !== func);
          if (__DEV__)
            _global.__DEV_SUBCS__[_idx] = _global.__DEV_SUBCS__[_idx]?.filter?.((f) => f !== func);
        };
      }, [func]);
    }

    function get(param?: string, ...params: string[]): any {
      let out: any = value;
      if (param) {
        const _params = [param, ...params]
        if (_params.length > 0)
          for (let i = 0; i < _params.length; i++) {
            if (out && _params[i] != undefined)
              out = out?.[_params[i]];
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

    globalIdx.increment()
    return { useState, get, set, useSelector, reset: del, connect: _connect };
  }
  return m
}

export default m()
