// withHooks
// noPage

import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export interface LibKeyboard_avoidProps {
  children?: any,
  style?: ViewStyle
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/keyboard_avoid.md) untuk melihat dokumentasi*/
export default function m(props: LibKeyboard_avoidProps): any {
  return (
    <KeyboardAvoidingView behavior={Platform.OS == 'android' ? 'height' : 'padding'} style={[{ flex: 1 }, props.style]} >
      {props.children}
    </KeyboardAvoidingView>
  )
}

