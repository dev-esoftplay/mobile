import { useCallback, useEffect, useRef, useState } from 'react';

type useSafeStateReturn<T> = [T | undefined, (value: T | undefined) => void, () => T];

export default function useSafeState<T = any>(defaultValue?: T): useSafeStateReturn<T> {
  const isMountedRef = useRef<boolean>(true);
  const [state, setState] = useState<T | undefined>(defaultValue);

  const updateState = useCallback((value: T | undefined) => {
    if (isMountedRef.current) {
      setState(value)
      // InteractionManager.runAfterInteractions(() => setState(value))
    }
  }, []);

  const getter = () => {
    return state
  }

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [state, updateState, getter];
}
