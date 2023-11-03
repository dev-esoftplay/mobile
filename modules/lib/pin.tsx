// withHooks
// noPage

import React, { useEffect, useRef, useState } from 'react';
import { TextInput, View, ViewStyle } from 'react-native';

export interface LibPinProps {
  length: number,
  onChangePin: (pin: string) => void
  boxStyle?: ViewStyle,
  overrideKeyboard?: boolean,
  pinValue?: string,
  pinStyle?: ViewStyle
}
export default function m(props: LibPinProps): any {
  const [pin, setPin] = useState<string[]>([])
  const input = useRef<TextInput>(null)

  useEffect(() => {
    setTimeout(() => { input?.current?.focus() }, 100);
    setPin(props?.pinValue?.split?.(''))
    props.onChangePin(props?.pinValue || '')
  }, [props.pinValue])

  return (
    <View>
      <View style={{ alignItems: 'center', marginTop: 20 }} >
        <View style={{ height: 70 }} >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
            {
              new Array(props.length).fill('').map((_, i) => (
                <View key={i} style={{ height: 40, width: 40, margin: 5, borderRadius: 4, borderWidth: 0.5, borderColor: '#444', ...props.boxStyle, alignItems: 'center', justifyContent: 'center' }}>
                  {!!pin?.[i] && <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: '#444', ...props.pinStyle }} />}
                </View>
              ))
            }
          </View>
          {
            !props.overrideKeyboard &&
            <View style={{ flexDirection: 'row', width: 60 * props.length, alignSelf: 'center', justifyContent: 'center' }} >
              <TextInput
                ref={input}
                contextMenuHidden={true}
                keyboardType='numeric'
                secureTextEntry
                style={{ opacity: 0, marginLeft: -400, width: 400 + 60 * props.length, fontSize: 0, height: 60, marginTop: -40, alignSelf: 'flex-start' }}
                autoFocus
                onChangeText={(t: string) => {
                  if (t.length == props.length) {
                    input.current!.blur()
                  }
                  let _t: string[] = t.split('')
                  setPin(_t)
                  props.onChangePin(t)
                }} maxLength={props.length} />
            </View>
          }
        </View>
      </View>
    </View>
  )
}