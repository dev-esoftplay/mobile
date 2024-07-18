import FastStorage from 'esoftplay/mmkv';
import { useCallback, useEffect, useRef, useState } from 'react';

type usePersistStateReturn<T> = [T, (newState: T | ((newState: T) => T)) => void, () => T];

export default function usePersistState<T = any>(persistKey: string, defaultValue?: T): usePersistStateReturn<T> {
  const isMountedRef = useRef<boolean>(true);
  const storedValue = FastStorage.getItemSync(persistKey);
  let parsedValue: T | undefined;
  if (storedValue) {
    try {
      parsedValue = JSON.parse(storedValue);
    } catch (e) {
      parsedValue = defaultValue;
    }
  } else {
    parsedValue = defaultValue;
  }
  const valueRef = useRef<T>(parsedValue as T);
  const [, rerender] = useState({});

  const updateState = useCallback((value: T | ((prevState: T) => T)) => {
    if (isMountedRef.current) {
      if (typeof value === 'function') {
        valueRef.current = (value as (prevState: T) => T)(valueRef.current);
      } else {
        valueRef.current = value;
      }

      if (valueRef.current != undefined)
        FastStorage.setItem(persistKey, JSON.stringify(valueRef.current))
      else
        FastStorage.removeItem(persistKey)
      rerender({});
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [valueRef.current, updateState, () => valueRef.current];
}
