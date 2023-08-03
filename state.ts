import { useCallback, useEffect, useRef, useState } from 'react';

type useSafeStateReturn<T> = [T | undefined, (value: T | undefined) => void, () => T];

export default function useSafeState<T = any>(defaultValue?: T): useSafeStateReturn<T> {
  const isMountedRef = useRef<boolean>(true);
  const valueRef = useRef(defaultValue)
  const [state, setState] = useState<T | undefined>(defaultValue);

  const updateState = useCallback((value: T | undefined) => {
    if (isMountedRef.current) {
      valueRef.current = value;
      setState(value)
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

  return [state, updateState, getter];
}
