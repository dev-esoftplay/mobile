// withHooks
// noPage

import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';

export interface LibFocusProps {
  isFocused?: boolean
  blurView?: any,
  onFocus?: () => void,
  onBlur?: () => void,
  style?: ViewStyle,
  children?: any
}
export interface LibFocusState {

}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/focus.md) untuk melihat dokumentasi*/
export default function m(props: LibFocusProps): any {
  const isFocused = useIsFocused()

  useEffect(() => {
    const callback = isFocused ? props.onFocus : props.onBlur
    if (typeof callback === "function") {
      const task = requestIdleCallback(callback)
      return () => cancelIdleCallback(task)
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