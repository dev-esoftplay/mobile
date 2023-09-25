import { useCallback, useEffect, useRef, useState } from 'react';

type useSafeStateReturn<T> = [T, (value: T) => void, () => T];

export default function useSafeState<T = any>(defaultValue?: T): useSafeStateReturn<T> {
  const isMountedRef = useRef<boolean>(true);
  const valueRef = useRef(defaultValue)
  const [, rerender] = useState({})

  const updateState = useCallback((value: T | undefined) => {
    if (isMountedRef.current) {
      if (typeof value == 'function') {
        valueRef.current = value(valueRef.current)
      } else {
        valueRef.current = value;
      }
      rerender({})
    }
  }, []);

  const getter = () => {
    return valueRef.current
  }

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [valueRef.current, updateState, getter];
}
