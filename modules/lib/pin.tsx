// withHooks

import React, { useState, useRef } from 'react';
import { View, Text, TextInput } from 'react-native';


export interface LibPinProps {
  length: number,
  onChangePin: (pin: string) => void
  boxStyle?: any,
  pinStyle?: any
}
export default function m(props: LibPinProps): any {
  const [pin, setPin] = useState<string[]>([])
  const input = useRef<TextInput>(null)
  return (
    <View>
      <View style={{ alignItems: 'center', marginTop: 20 }} >
        <View style={{ height: 70 }} >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
            {
              new Array(props.length).fill('').map((_, __) => (
                <View key={__} style={{ height: 40, width: 40, margin: 5, borderRadius: 4, borderWidth: 0.5, borderColor: '#444', ...props.boxStyle }} />
              ))
            }
          </View>
          <View style={{ flexDirection: 'row', width: 60 * props.length, alignSelf: 'center', marginLeft: 60 }} >
            {
              pin && pin.map((item: any, i: number) => (
                <Text key={i} style={{ textAlign: 'center', width: 40, height: 40, marginTop: -40, fontFamily: 'digital', fontSize: 40, margin: 5, ...props.pinStyle }} >•</Text>
              ))
            }
          </View>
          <View style={{ flexDirection: 'row', width: 60 * props.length, alignSelf: 'center', justifyContent: 'center' }} >
            <TextInput
              ref={input}
              contextMenuHidden={true}
              keyboardType='numeric'
              style={{ opacity: 0, marginLeft: -400, width: 400 + 60 * props.length, fontSize: 0, height: 60, marginTop: -40, alignSelf: 'flex-start' }} autoFocus onChangeText={(t: string) => {
                if (t.length == props.length) {
                  input.current!.blur()
                }
                let _t: string[] = t.split('')
                setPin(_t)
                props.onChangePin(t)
              }} maxLength={6} />
          </View>
        </View>
      </View>
    </View>
  )
}