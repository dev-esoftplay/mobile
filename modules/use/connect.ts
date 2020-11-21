// useLibs

import React, { useEffect, useState } from 'react';
import { UseDataProperty } from 'esoftplay'

export function set(id: string, x: any) {
  if (UseDataProperty.c?.a?.[id] && UseDataProperty.c?.b?.[id]) {
    UseDataProperty.c.a[id] = x
    UseDataProperty.c.b[id].forEach(d => {
      d(x)
    });
  }
}

export function get(id: string): any {
  return UseDataProperty.c?.a?.[id]
}

export default function m<M>(id: string, def?: M): [M, (M) => void] {

  if (!UseDataProperty.c.b) UseDataProperty.c.b = {}
  if (!UseDataProperty.c.b[id]) UseDataProperty.c.b[id] = []

  if (!UseDataProperty.c.a) UseDataProperty.c.a = {}
  if (!UseDataProperty.c.a[id]) UseDataProperty.c.a[id] = undefined

  const d = UseDataProperty.c.a[id] || def

  const [a, b] = useState<M>(d)

  function c(x: M) {
    set(id, x)
  }

  useEffect(() => {
    UseDataProperty.c.b[id].push(b)
    return () => {
      UseDataProperty.c.b[id] = UseDataProperty.c.b[id].filter((x) => b !== x)
    }
  }, [])

  return [a, c]
}