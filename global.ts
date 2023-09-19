import * as R from 'react';
export interface useGlobalReturn<T> {
  useState: () => [T, (newState: T | ((newState: T) => T)) => void, () => T],
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

let timeoutFinish: NodeJS.Timeout
export default function useGlobalState<T>(initValue: T, o?: useGlobalOption): useGlobalReturn<T> {
  let STORAGE: any = undefined
  const isEqual = require('react-fast-compare');
  const subsSetter = new Set<Function>()
  let value: T = initValue;
  let loaded = -1

  if (o?.persistKey) {
    STORAGE = o?.inFile ? (require('esoftplay/storage').default) : (require('@react-native-async-storage/async-storage').default)
    loaded = 0
    if (o?.loadOnInit)
      loadFromDisk()
  }

  function loadFromDisk() {
    if (loaded == 0) {
      loaded = 1
      let persistKey = o?.persistKey
      STORAGE.getItem(String(persistKey)).then((p: any) => {
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
    if (o?.persistKey) {
      const UserData = require('./modules/user/data').default
      if (UserData)
        UserData?.register?.(o?.persistKey)
    }
  }

  function set(ns: T | ((old: T) => T)) {
    let newValue: any
    if (ns instanceof Function) {
      newValue = ns(value)
    } else {
      newValue = ns
    }
    const isChange = !isEqual(value, newValue)
    if (isChange) {
      value = newValue
      subsSetter.forEach((c) => c?.(newValue))
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

    let sl = (ns: T) => {
      let n = se(ns);
      if (!isEqual(l, n))
        s(n);
    }

    R.useLayoutEffect(() => {
      subsSetter.add(sl)
      return () => {
        subsSetter.delete(sl)
      };
    }, [sl]);

    return l;
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


  function useState(): [T, (newState: T | ((newState: T) => T)) => void, () => T] {
    loadFromDisk()
    let [l, s] = R.useState<T>(value);

    R.useLayoutEffect(() => {
      subsSetter.add(s)
      return () => {
        subsSetter.delete(s)
      };
    }, [s]);

    return [l, set, () => value];
  };

  function _connect(props: useGlobalConnect<T>): any {
    const [state] = useState()
    const children = props.render(state)
    return children ? R.cloneElement(children) : null
  }

  return { useState, get, set, useSelector, reset: del, connect: _connect };
}
