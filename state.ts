import { useRef, useEffect, useState } from 'react'

export default function m(def?: any) {
  const r = useRef<boolean>(false)
  const [a, b] = useState(def)

  function c(value: any) {
    if (r.current) {
      b(value)
    }
  }
  
  useEffect(() => {
    r.current = true
    return () => { r.current = false }
  }, [])

  return [a, c]
};