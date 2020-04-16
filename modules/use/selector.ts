// useLibs

import React from 'react'
import { useSelector } from 'react-redux'

export default function m(a: (state: any) => any): any {
  return useSelector(a)
}