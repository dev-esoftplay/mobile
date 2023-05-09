import { useCallback, useEffect, useRef, useState } from 'react';

type UseRefStateResult<T> = [T | undefined, (value: T | undefined) => void];

export default function useRefState<T = any>(defaultValue?: T): UseRefStateResult<T> {
  const isMountedRef = useRef<boolean>(true);
  const [state, setState] = useState<T | undefined>(defaultValue);

  const updateState = useCallback((value: T | undefined) => {
    if (isMountedRef.current) {
      setState(value)
      // InteractionManager.runAfterInteractions(() => setState(value))
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [state, updateState];
}
