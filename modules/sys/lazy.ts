//noPage
import { useEffect, useRef, useState } from 'react';

export default function useLazyState<T>(initialState?: T): [T, (newValue: T | ((prev: T) => T)) => () => void, () => T] {
  const [, rerender] = useState({});
  const dispatch = () => rerender({});
  const value = useRef<T>(initialState as T);
  const isMounted = useRef(true);

  const setter = (newValue: T | ((prev: T) => T)) => {
    if (isMounted.current) {
      if (typeof newValue === 'function') {
        value.current = (newValue as (prev: T) => T)(value.current);
      } else {
        value.current = newValue;
      }
    }
    return () => {
      if (isMounted.current) {
        dispatch();
      }
    };
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return [value.current, setter, () => value.current];
}
