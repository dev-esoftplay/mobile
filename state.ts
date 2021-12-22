import { useEffect, useRef, useState } from 'react';
import { isEqual } from 'react-fast-compare';

export default function m(def?: any) {
  const r = useRef<boolean>(true)
  const oldValue = useRef<any>(def)
  const [a, b] = useState(def)

  function c(value: any) {
    if (r.current && !isEqual(value, oldValue.current)) {
      oldValue.current = value
      b(value)
    }
  }

  useEffect(() => {
    r.current = true
    return () => { r.current = false }
  }, [])

  return [a, c]
};