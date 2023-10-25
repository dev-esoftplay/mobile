import { useCallback, useEffect, useRef, useState } from 'react';

type useSafeStateReturn<T> = [T, (newState: T | ((newState: T) => T)) => void, () => T];

export default function useSafeState<T = any>(defaultValue?: T): useSafeStateReturn<T> {
  const isMountedRef = useRef<boolean>(true);
  const valueRef = useRef<T>(defaultValue as T);
  const [, rerender] = useState({});

  const updateState = useCallback((value: T | ((prevState: T) => T)) => {
    if (isMountedRef.current) {
      if (typeof value === 'function') {
        valueRef.current = (value as (prevState: T) => T)(valueRef.current);
      } else {
        valueRef.current = value;
      }
      rerender({});
    }
  }, []);

  const getter = () => {
    return valueRef.current;
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [valueRef.current, updateState, getter];
}
