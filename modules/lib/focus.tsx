// withHooks
// noPage

import { useIsFocused } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export interface LibFocusProps {
  isFocused?: boolean
  blurView?: any,
  onFocus?: () => void,
  onBlur?: () => void,
  style?: any
  children?: any
}
export interface LibFocusState {

}

export default function m(props: LibFocusProps): any {

  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused) {
      props?.onFocus?.()
    } else {
      props?.onBlur?.()
    }
  }, [isFocused]);

  if (!props.isFocused) {
    if (props.blurView)
      return props.blurView
    if (props.style)
      return <View style={props.style} />
    return null
  }

  return props.children || null
}