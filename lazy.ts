import { useLayoutEffect, useRef, useState } from 'react';

export default function useLazyState<T>(initialState: T): [T, (newValue: T) => () => void] {
  const [, rerender] = useState({})
  const dispatch = () => { rerender({}) }
  const value = useRef(initialState)
  const isMounted = useRef(true)
  const setter = (newValue: T) => {
    if (isMounted.current)
      value.current = newValue;
    return () => {
      if (isMounted.current)
        dispatch()
    }
  }

  useLayoutEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  return [value.current, setter]
}