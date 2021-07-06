// useLibs

import { useEffect } from 'react';
import { fastFilter, fastLoop } from './../../fast';
import { LibObject, useSafeState } from 'esoftplay';

export default (() => {
  let dt = {}
  return function m<S>(formName: string, def?: S): [S, (a: string) => (v: any) => void, (a?: (x?: S) => void) => void, () => void, (x: S) => void] {
    const [a, b] = useSafeState<S>(dt && dt[formName] || def)

    function c(field: any) {
      dt[formName] = dt[formName] || {}
      field = field || {}
      dt[formName] = LibObject.assign(dt[formName], field)();
      fastLoop(dt['setter-' + formName], (set) => {
        set?.(dt[formName])
      })
    }

    useEffect(() => {
      if (!dt['setter-' + formName]) {
        dt['setter-' + formName] = []
      }
      dt['setter-' + formName].push(b)
      c(dt[formName])
      return () => {
        dt['setter-' + formName] = fastFilter(dt['setter-' + formName], (x) => x !== b)
      }
    }, [])

    function g(field: string) {
      return (value: any) => {
        c({ [field]: value })
      }
    }

    function h() {
      delete dt[formName]
    }

    function f(callback?: (a?: S) => void) {
      callback?.(dt[formName])
    }

    return [a, g, f, h, c]
  }
})()