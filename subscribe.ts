// useLibs

import React from 'react';

export interface useGlobalSubscriberReturn {
  getValue: (value?: any) => void,
  reset: () => void,
  useSubscribe: Function,
  trigger: (newValue?: any) => void
}

export default function useGlobalSubscriber(defaultValue?: any): useGlobalSubscriberReturn {
  const subscribers = new Set<Function>();
  let value = defaultValue;

  function getValue() {
    return value;
  }

  function reset() {
    value = defaultValue;
  }

  const trigger = (newValue?: any) => {
    notify(newValue);
  }
  
  function useSubscribe(func: Function) {
    React.useLayoutEffect(() => {
      subscribers.add(func)
      return () => {
        subscribers.delete(func)
        if (subscribers.size == 0) reset()
      }
    }, [])
    
    return trigger;
  }
  
  function notify(newValue?: any) {
    value = newValue;
    subscribers.forEach((fun: Function) => fun?.(newValue));
  }

  return {
    getValue,
    useSubscribe,
    reset,
    trigger
  };
}