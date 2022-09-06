import AsyncStorage from '@react-native-async-storage/async-storage';
import * as R from 'react';
import { fastFilter, fastLoop } from './fast';
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
  inFile?: boolean,
  listener?: (data: any) => void,
  isUserData?: boolean
}

export interface useGlobalConnect<T> {
  render: (props: T) => any,
}

_global.useGlobalUserDelete = {}
let useGlobalSubscriber = {}

class Context {
  idx = 0
  increment = () => this.idx++
  reset = () => {
    this.idx = 0
  }
}

export const globalIdx = new Context()
export default function useGlobalState<T>(initValue: T, o?: useGlobalOption): useGlobalReturn<T> {
  const Storage = require('./storage').default;
  const STORAGE = o?.inFile ? new Storage() : AsyncStorage
  const _idx = globalIdx.idx
  if (!useGlobalSubscriber[_idx])
    useGlobalSubscriber[_idx] = [];
  let value: T = initValue;

  if (o?.persistKey) {
    let persistKey = o?.persistKey
    STORAGE.getItem(persistKey).then((p) => {
      if (p) {
        if (p.includes("\\\\\\\\")) {
          if (persistKey)
            STORAGE.clear()
          return
        }
        if (p != undefined && typeof p == 'string' && (p.startsWith("{") || p.startsWith("[")))
          try { set(JSON.parse(p)) } catch (error) { }
        else
          try { /* @ts-ignore */ set(eval(p)) } catch (error) { }
      }
    })
  }

  /* register to userData to automatically reset state and persist */
  if (o?.isUserData) {
    function resetFunction() {
      set(initValue)
    }
    if (o?.persistKey) {
      const esp = require('./esp').default;
      const UserData = esp.mod('user/data')
      if (UserData)
        UserData?.register?.(o?.persistKey)
    }
    _global.useGlobalUserDelete[_idx] = resetFunction
  }

  function set(ns: T) {
    const isChange = !isEqual(value, ns)
    if (isChange) {
      value = ns
      fastLoop(useGlobalSubscriber?.[_idx], (c) => { c?.(ns) })
      if (o?.persistKey && ns != undefined) {
        let data: any
        switch (typeof ns) {
          case 'object':
            if (ns != null || ns != undefined)
              data = JSON.stringify(ns)
            break;
          default:
            data = String(ns)
        }
        STORAGE.setItem(o.persistKey, data)
      }
      if (o?.listener)
        o.listener(ns)
    }
  };

  function del() {
    if (o?.persistKey) {
      STORAGE.removeItem(o.persistKey)
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
    R.useLayoutEffect(() => {
      useGlobalSubscriber?.[_idx]?.push?.(func);
      return () => {
        useGlobalSubscriber[_idx] = fastFilter(useGlobalSubscriber?.[_idx], (f) => f !== func)
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
