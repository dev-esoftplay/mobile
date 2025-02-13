// useLibs
// noPage
import useSafeState from 'esoftplay/state';
import { useLayoutEffect } from 'react';


let dt = {}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/use/form.md) untuk melihat dokumentasi*/
export default function m<S>(formName: string, def?: S): [S, (a: string) => (v: any) => void, (a?: (x?: S) => void) => void, () => void, (x: S) => void] {
  const [a, b] = useSafeState<S>(dt && dt[formName] || def)

  function c(field: any) {
    dt[formName] = {
      ...dt?.[formName],
      ...field
    }
    dt['setter-' + formName].forEach(set => {
      set(dt[formName])
    });
  }

  useLayoutEffect(() => {
    if (!dt['setter-' + formName]) {
      dt['setter-' + formName] = []
    }
    dt['setter-' + formName].push(b)
    c(dt[formName])
    return () => {
      dt['setter-' + formName] = dt['setter-' + formName].filter((x) => x !== b)
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