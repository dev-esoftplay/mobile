import esp from 'esoftplay/esp';
import * as R from 'react';
import { createDebounce } from './timeout';

export interface useGlobalReturn<T> {
  useState: () => [T, (newState: T | ((newState: T) => T)) => void, () => T],
  get: (param?: string, ...params: string[]) => T,
  set: (x: T | ((old: T) => T)) => void,
  reset: () => void,
  listen: (cb: (value: T) => void) => () => void
  sync: () => () => void,
  connect: (props: useGlobalConnect<T>) => any,
  useSelector: (selector: (state: T) => any) => any;
}

export interface useGlobalAutoSync {
  url: string,
  post: (item: any) => Object,
  delayInMs?: number,
  isSyncing?: (isSync: boolean) => void
}

export interface useGlobalOption {
  persistKey?: string,
  inFile?: boolean,
  inFastStorage?: boolean,
  listener?: (data: any) => void,
  useAutoSync?: useGlobalAutoSync,
  jsonBeautify?: boolean,
  isUserData?: boolean,
  loadOnInit?: boolean,
  onFinish?: () => void
}

export interface useGlobalConnect<T> {
  selector?: (props: T) => any,
  render: (props: Partial<T> | T) => any,
}
export let userDataReset: Function[] = []
let timeoutFinish: NodeJS.Timeout
export default function useGlobalState<T>(initValue: T, o?: useGlobalOption): useGlobalReturn<T> {
  let STORAGE: any = undefined
  const isEqual = require('react-fast-compare');
  const subsSetter = new Set<Function>()
  let value: T = initValue;
  let listener = new Set<Function>()
  let loaded = -1
  let taskSync: any = undefined

  if (o?.persistKey) {
    STORAGE = o?.inFastStorage ? require('esoftplay/mmkv').default : (o?.inFile ? (require('esoftplay/storage').default) : (require('@react-native-async-storage/async-storage').default))
    loaded = 0
    if (o?.loadOnInit)
      loadFromDisk()
  }

  function _sync() {
    const debounce = createDebounce()
    if (o?.useAutoSync && taskSync && Array.isArray(value)) {
      debounce.set(taskSync[0]?.(value.filter((item: any) => item.synced != 1)), 16)
    }
    return () => {
      if (o?.useAutoSync && taskSync && Array.isArray(value)) {
        taskSync?.[1]?.()
        debounce.set(taskSync[0]?.(value.filter((item: any) => item.synced != 1)), 16)
      }
    }
  }

  if (o?.useAutoSync) {
    const LibCurl = esp.mod("lib/curl")
    const UseTasks = esp.mod("use/tasks")
    taskSync = UseTasks()((item) => new Promise((next) => {
      const debounce = createDebounce()
      const delayInMs = o?.useAutoSync?.delayInMs || 0
      const { isOnline, isInternetReachable } = esp.mod("lib/net_status").state().get()
      if (isOnline && isInternetReachable) {
        if (o?.useAutoSync) {
          o?.useAutoSync?.isSyncing?.(true)
          new LibCurl(o.useAutoSync.url, o.useAutoSync?.post?.(item),
            (res, msg) => {
              set((old: T) => {
                if (Array.isArray(old)) {
                  const index = old?.indexOf(item)
                  return esp.mod("lib/object").set(old, 1)(index, 'synced')
                } else {
                  return old
                }
              })
              debounce.set(next, delayInMs)
            }, () => {
              debounce.set(next, delayInMs)
            }
          )
        }
      } else {
        debounce.set(next, delayInMs)
      }
    }), () => {
      o?.useAutoSync?.isSyncing?.(false)
    })
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
            clearTimeout(timeoutFinish)
          }, 50);
        }
      })
    }
  }

  function listen(cb: (value: T) => void): () => void {
    listener.add(cb)
    return () => listener.delete(cb)
  }

  /* register to userData to automatically reset state and persist */
  if (o?.isUserData) {
    if (o?.persistKey) {
      userDataReset.push(del)
      const UserData = esp?.mod?.("user/data")
      if (UserData) {
        UserData?.register?.(o?.persistKey)
      }
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
      if (o?.useAutoSync && taskSync)
        taskSync?.[0]?.(newValue.filter((item: any) => item.synced != 1))
      if (listener.size > 0) {
        listener.forEach((fun) => fun?.(newValue))
      }
    }
  };

  function del() {
    if (o?.persistKey) {
      STORAGE.removeItem(o.persistKey)
    }
    set(initValue)
  }

  function useSelector(se: (state: T) => any): Partial<T> | T {
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
    const state = props.selector ? useSelector(props.selector) : useState()[0]
    const children = props.render(state)
    return children ? R.cloneElement(children) : null
  }

  return { useState, get, set, useSelector, reset: del, connect: _connect, sync: _sync, listen: listen };
}
