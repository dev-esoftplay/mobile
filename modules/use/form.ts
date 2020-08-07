// useLibs

import { useEffect } from 'react';
import { useSafeState, UseForm_dataProperty } from 'esoftplay';

export default function m<S>(formName: string, def?: S): [S, (a: string) => (v: any) => void, (a?: (x?: S) => void) => void, () => void, (x: S) => void] {
  const [a, b] = useSafeState<S>(UseForm_dataProperty.useFormData && UseForm_dataProperty.useFormData[formName] || def)

  function c(field: any) {
    UseForm_dataProperty.useFormData[formName] = {
      ...UseForm_dataProperty.useFormData[formName],
      ...field
    }
    b({
      ...UseForm_dataProperty.useFormData[formName],
    })
  }

  useEffect(() => {
    c(UseForm_dataProperty.useFormData[formName])
  }, [])

  useEffect(() => {
    UseForm_dataProperty.useFormData[formName] = { ...UseForm_dataProperty.useFormData[formName], ...a }
  }, [a])

  function g(field: string) {
    return (value: any) => {
      c({ [field]: value })
    }
  }

  function h() {
    delete UseForm_dataProperty.useFormData[formName]
  }

  function f(callback?: (a?: S) => void) {
    const restate = {
      ...UseForm_dataProperty.useFormData[formName],
    }
    if (callback)
      callback(restate)
  }
  return [a, g, f, h, b]
}