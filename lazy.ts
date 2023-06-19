import { useEffect, useRef, useState } from 'react';

export default function useLazyState<T>(initialState?: T): [T, (newValue: T) => () => void, () => T] {
  const [, rerender] = useState({})
  const dispatch = () => { rerender({}) }
  const value = useRef(initialState)
  const isMounted = useRef(true)

  const getter = () => {
    return value.current
  }

  const setter = (newValue: T) => {
    if (isMounted.current) {
      value.current = newValue;
    }
    return () => {
      if (isMounted.current) {
        dispatch()
      }
    }
  }

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  return [value.current, setter, getter]
}