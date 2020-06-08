// useLibs

import React, { useRef, useEffect } from 'react';
import { TextInput } from 'react-native';
import { LibUtils, _global, useSafeState, esp } from 'esoftplay';

export interface LibInput_baseProps {
  name: string,
  children?: any,
  onChangeText: (text: string, textMasked: string) => void,
  placeholder?: string,
  mask?: string,
  maskFrom?: 'start' | 'end',
  allowFontScaling?: boolean,
  autoCapitalize?: "none" | "sentences" | "words" | "characters",
  autoCorrect?: boolean,
  autoFocus?: boolean,
  blurOnSubmit?: boolean,
  caretHidden?: boolean,
  contextMenuHidden?: boolean,
  defaultValue?: string,
  editable?: boolean,
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad",
  maxLength?: number,
  multiline?: boolean,
  onSubmitEditing?: () => void,
  placeholderTextColor?: string,
  returnKeyType?: "done" | "go" | "next" | "search" | "send",
  secureTextEntry?: boolean,
  selectTextOnFocus?: boolean,
  selectionColor?: string,
  style?: any,
  value?: string,
}


export function focus(name: string): void {
  _global['inputRef'][name]?.current!.focus()
}
export function blur(name: string): void {
  _global['inputRef'][name]?.current!.blur()
}
export function setText(name: string): (text: string) => void {
  return (text: string) => {
    _global['inputRef'][name].current!.setNativeProps({ text: mask(name, text) })
  }
}

function mask(name: string, text: string): string {
  let _text = text
  let { mask, maskFrom } = _global.inputMask[name]
  if (mask) {
    if (!maskFrom) maskFrom = 'start'
    let rMask = mask.split("")
    let rText = unmask(name, _text).split("")
    if (maskFrom == 'end') {
      rMask = [...rMask.reverse()]
      rText = [...rText.reverse()]
    }
    let maskedText = ''
    var _addRange = 0
    var _addMaskChar = ''
    for (let i = 0; i < rMask.length; i++) {
      const iMask = rMask[i];
      if (iMask == '#') {
        if (rText[i - _addRange] != undefined) {
          maskedText += _addMaskChar + rText[i - _addRange]
        }
        else {
          break
        }
        _addMaskChar = ''
      }
      else {
        _addMaskChar += iMask
        _addRange++
      }
    }
    if (maskFrom == 'end') {
      maskedText = maskedText.split('').reverse().join('')
    }
    // _global['inputRef'][name].current!.setNativeProps({ text: maskedText })
    return maskedText
  }
  return _text
}

function unmask(name: string, text: string): string {
  let _text = text
  let { mask } = _global.inputMask[name]
  if (mask) {
    let masks = mask.match(/((?!\#).)/g)
    if (masks) {
      for (let i = 0; i < masks.length; i++) {
        _text = _text.replace(new RegExp(LibUtils.escapeRegExp(masks[i]), 'g'), '')
      }
    }
    return _text
  }
  return _text
}

export default function m(props: LibInput_baseProps): any {
  init()
  _global['inputRef'][props.name] = useRef<TextInput>(null);
  _global['inputMask'][props.name] = {
    mask: props.mask,
    maskFrom: props.maskFrom
  }

  useEffect(() => {
    _global['inputRef'][props.name].current!.blur()
  }, [])

  function init(): void {
    if (!_global.hasOwnProperty('inputRef')) {
      _global.inputRef = {}
    }
    if (!_global.hasOwnProperty('inputMask')) {
      _global.inputMask = {}
    }
  }

  const setups = {
    ...props,
    onChangeText: (t: string) => {
      const maskedText = mask(props.name, t)
      const unmaskedText = unmask(props.name, t)
      _global['inputRef'][props.name].current!.setNativeProps({ text: maskedText })
      props.onChangeText(unmaskedText, maskedText)
    },
    maxLength: props.mask ? props.mask.length : undefined,
    ref: _global['inputRef'][props.name]
  }
  return props.children ? React.cloneElement(props.children, { ...setups }) : <TextInput {...setups} />
}