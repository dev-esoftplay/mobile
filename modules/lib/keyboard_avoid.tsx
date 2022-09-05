// withHooks
// noPage

import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

export interface LibKeyboard_avoidProps {
  children?: any,
  style?: any
}
export default function libkeyboard_avoid(props: LibKeyboard_avoidProps): any {
  return (
    <KeyboardAvoidingView behavior={Platform.OS == 'android' ? 'height' : 'padding'} style={props.style} >
      {props.children}
    </KeyboardAvoidingView>
  )
}