import * as R from 'react'
import AsyncStorage from '@react-native-community/async-storage';

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

  function set(ns: T | ((prev: T) => T), ac?: (ns: T) => any, ca?: (ns: T) => any) {
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

  function subscribe(sl: any) {
    R.useEffect(() => {
      sb.push(sl);
      return () => {
        sb = sb.filter((f) => f !== sl);
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

  return { useState, get: () => v, set: set };
}