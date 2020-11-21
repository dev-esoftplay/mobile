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
    UseForm_dataProperty.useFormData['setter-' + formName].forEach(set => {
      set(UseForm_dataProperty.useFormData[formName])
    });
  }

  useEffect(() => {
    if (!UseForm_dataProperty.useFormData['setter-' + formName]) {
      UseForm_dataProperty.useFormData['setter-' + formName] = []
    }
    UseForm_dataProperty.useFormData['setter-' + formName].push(b)
    c(UseForm_dataProperty.useFormData[formName])
    return () => {
      UseForm_dataProperty.useFormData['setter-' + formName].filter((x) => x !== b)
    }
  }, [])

  function g(field: string) {
    return (value: any) => {
      c({ [field]: value })
    }
  }

  function h() {
    delete UseForm_dataProperty.useFormData[formName]
  }

  function f(callback?: (a?: S) => void) {
    callback?.(UseForm_dataProperty.useFormData[formName])
  }
  
  return [a, g, f, h, b]
}