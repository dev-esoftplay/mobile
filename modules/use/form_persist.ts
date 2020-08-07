// useLibs

import React, { useEffect } from 'react';
import { usePersistState, UseForm_dataProperty } from 'esoftplay';
import AsyncStorage from '@react-native-community/async-storage';

export default function m<S>(formName: string, def?: S): [S, (a: string) => (v: any) => void, (a?: (x?: S) => void) => void, () => void, (x: S) => void] {
  const [a, b, d, e] = usePersistState<S>('useForm-' + formName, def)
  function c(field: any) {
    UseForm_dataProperty.useFormData[formName] = {
      ...UseForm_dataProperty.useFormData[formName],
      ...field
    }
    b({
      ...UseForm_dataProperty.useFormData[formName],
      ...a,
      ...field
    })
  }

  useEffect(() => {
    UseForm_dataProperty.useFormData[formName] = { ...UseForm_dataProperty.useFormData[formName], ...a }
  }, [a])

  function g(field: string) {
    return (value: any) => {
      c({ [field]: value })
    }
  }

  function h() {
    UseForm_dataProperty.useFormData[formName] = undefined
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