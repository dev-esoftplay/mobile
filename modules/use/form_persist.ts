// useLibs
// noPage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistState } from 'esoftplay';
import { useEffect } from 'react';

export default (() => {
  let dt = {}
  return function m<S>(formName: string, def?: S): [S, (a: string) => (v: any) => void, (a?: (x?: S) => void) => void, () => void, (x: S) => void] {
    const [a, b, d, e] = usePersistState<S>(formName, def)
    function c(field: any) {
      dt[formName] = {
        ...dt?.[formName],
        ...field
      }
      b({
        ...dt?.[formName],
        ...a,
        ...field
      })
    }

    useEffect(() => {
      dt[formName] = { ...dt[formName], ...a }
    }, [a])

    function g(field: string) {
      return (value: any) => {
        c({ [field]: value })
      }
    }

    function h() {
      delete dt[formName]
      e()
    }

    function f(callback?: (a?: S) => void) {
      d()
      if (callback) {
        AsyncStorage.getItem('useForm-' + formName).then((r) => {
          if (r) {
            callback(JSON.parse(r))
          } else {
            callback(undefined)
          }
        })
      }
    }
    return [a, g, f, h, b]
  }
})()