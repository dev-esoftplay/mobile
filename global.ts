import AsyncStorage from '@react-native-async-storage/async-storage';
import _global from 'esoftplay/_global';
import { UserData } from 'esoftplay/cache/user/data/import';
import Storage from 'esoftplay/storage';
import * as R from 'react';
const isEqual = require('react-fast-compare');


export interface useGlobalReturn<T> {
  useState: () => [T, (newState: T) => void, () => T],
  get: (param?: string, ...params: string[]) => T,
  set: (x: T | ((old: T) => T)) => void,
  reset: () => void,
  connect: (props: useGlobalConnect<T>) => any,
  useSelector: (selector: (state: T) => any) => any;
}

export interface useGlobalOption {
  persistKey?: string,
  inFile?: boolean,
  listener?: (data: any) => void,
  jsonBeautify?: boolean,
  isUserData?: boolean,
  loadOnInit?: boolean,
  onFinish?: () => void
}

export interface useGlobalConnect<T> {
  render: (props: T) => any,
}

_global.useGlobalUserDelete = {}
_global.useGlobalSubscriber = {}

const Context = {
  idx: 0,
  increment: function () { this.idx++ },
  reset: function () {
    this.idx = 0
  }
}
export const globalIdx = Context
let timeoutFinish: NodeJS.Timeout
export default function useGlobalState<T>(initValue: T, o?: useGlobalOption): useGlobalReturn<T> {
  const STORAGE = o?.inFile ? Storage : AsyncStorage
  const _idx = o?.persistKey || globalIdx.idx
  if (!_global.useGlobalSubscriber[_idx])
    _global.useGlobalSubscriber[_idx] = [];
  let value: T = initValue;
  let loaded = -1

  if (o?.persistKey) {
    loaded = 0
    if (o?.loadOnInit)
      loadFromDisk()
  }


  function loadFromDisk() {
    if (loaded == 0) {
      loaded = 1
      let persistKey = o?.persistKey
      STORAGE.getItem(persistKey).then((p: any) => {
        if (p) {
          if (persistKey != '__globalReady')
            if (p != undefined && typeof p == 'string' && (p.startsWith("{") || p.startsWith("[")))
              try { set(JSON.parse(p)) } catch (error) { }
            else {
              if (p == "true" || p == "false") {
                try { /* @ts-ignore */ set(eval(p)) } catch (error) { }
              } else if (isNaN(p)) {
                try { /* @ts-ignore */ set(p) } catch (error) { }
              } else {
                try { /* @ts-ignore */ set(eval(p)) } catch (error) { }
              }
            }
        }
        if (o?.onFinish) {
          clearTimeout(timeoutFinish)
          timeoutFinish = setTimeout(() => {
            o.onFinish?.()
          }, 50);
        }
      })
    }
  }


  /* register to userData to automatically reset state and persist */
  if (o?.isUserData) {
    function resetFunction() {
      del()
    }
    if (o?.persistKey) {
      if (UserData)
        UserData?.register?.(o?.persistKey)
    }
    _global.useGlobalUserDelete[_idx] = resetFunction
  }

  function set(ns: T | ((old: T) => T)) {
    let newValue
    if (typeof ns == 'function') {
      newValue = ns(value)
    } else {
      newValue = ns
    }
    const isChange = !isEqual(value, newValue)
    if (isChange) {
      value = newValue
      _global.useGlobalSubscriber?.[_idx].forEach((c) => { c?.(newValue) })
      if (o?.persistKey && newValue != undefined) {
        let data: any
        switch (typeof newValue) {
          case 'object':
            if (newValue != null || newValue != undefined)
              data = o.jsonBeautify ? JSON.stringify(newValue, undefined, 2) : JSON.stringify(newValue)
            break;
          default:
            data = String(newValue)
        }
        STORAGE.setItem(o.persistKey, data)
      }
      if (o?.listener)
        o.listener(newValue)
    }
  };

  function del() {
    if (o?.persistKey) {
      STORAGE.removeItem(o.persistKey)
    }
    set(initValue)
  }

  function useSelector(se: (state: T) => any): void {
    loadFromDisk()

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
    R.useLayoutEffect(() => {
      _global.useGlobalSubscriber?.[_idx]?.push?.(func);
      return () => {
        _global.useGlobalSubscriber[_idx] = _global.useGlobalSubscriber?.[_idx].filter((f) => f !== func)
      };
    }, [func]);
  }

  function get(param?: string, ...params: string[]): any {
    loadFromDisk()
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


  function useState(): [T, (newState: T) => void, () => T] {
    loadFromDisk()

    let [l, s] = R.useState<T>(value);

    let sl = R.useCallback((ns: T) => { s(ns) }, []);


    subscribe(sl)

    return [l, set, () => value];
  };

  function _connect(props: useGlobalConnect<T>): any {
    const [state] = useState()
    const children = props.render(state)
    return children ? R.cloneElement(children) : null
  }

  globalIdx.increment()
  return { useState, get, set, useSelector, reset: del, connect: _connect };
}
