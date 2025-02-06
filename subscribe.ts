// useLibs

import React from 'react';
import { InteractionManager } from 'react-native';

export interface useGlobalSubscriberReturn {
  getValue: () => any,
  reset: () => void,
  useSubscribe: Function,
  trigger: (newValue?: any) => void
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/subscribe.md) untuk melihat dokumentasi*/
export default function useGlobalSubscriber(defaultValue?: any): useGlobalSubscriberReturn {
  const subscribers = new Set<Function>();
  let value = defaultValue;

  function getValue() {
    return value;
  }

  function reset() {
    value = defaultValue;
  }

  function useSubscribe(func: Function) {
    React.useLayoutEffect(() => {
      subscribers.add(func)
      return () => {
        subscribers.delete(func)
        if (subscribers.size == 0) reset()
      }
    }, [])

    return notify;
  }

  function notify(newValue?: any) {
    value = newValue;
    subscribers.forEach((fun: Function) => {
      InteractionManager.runAfterInteractions(() => {
        fun?.(newValue)
      })
    });
  }

  return {
    getValue,
    useSubscribe,
    reset,
    trigger: notify
  };
}