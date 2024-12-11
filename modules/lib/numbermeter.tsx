// withHooks

import { LibFont } from 'esoftplay/cache/lib/font/import';
import { LibGradient } from 'esoftplay/cache/lib/gradient/import';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import React, { useRef } from 'react';
import { FlatList, TextInput, View } from 'react-native';


export interface LibNumbermeterArgs {

}
export interface LibNumbermeterProps {
  range: [number, number],
  onValueChange: (value: number) => void,
  valueDisplayEdit?: (value: string) => string
}
export default function m(props: LibNumbermeterProps): any {
  const valueRef = useRef<TextInput>(null)

  let value = useRef(0)


  function interpolate(input: number, inputRange: number[], outputRange: number[], clamp = true) {
    if (inputRange.length !== outputRange.length || inputRange.length < 2) {
      throw new Error("Input and output ranges must have the same length and at least two values.");
    }

    // Find the segment of the range where the input belongs
    for (let i = 0; i < inputRange.length - 1; i++) {
      if (input >= inputRange[i] && input <= inputRange[i + 1]) {
        // Interpolate within this segment
        const t = (input - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
        const value = outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
        return clamp
          ? Math.max(outputRange[0], Math.min(outputRange[outputRange.length - 1], value))
          : value;
      }
    }

    // If the input is outside the range, clamp to the nearest bound
    if (clamp) {
      if (input < inputRange[0]) {
        return outputRange[0];
      }
      if (input > inputRange[inputRange.length - 1]) {
        return outputRange[outputRange.length - 1];
      }
    }

    throw new Error("Input value could not be interpolated.");
  }

  const max = props.range[1]
  const min = String(props.range[0])

  function display(input: string) {
    if (props.valueDisplayEdit) {
      return props.valueDisplayEdit(input)
    } else
      return input
  }

  return (
    <View>
      <View style={{ alignItems: 'center' }} >
        <TextInput editable={false} ref={valueRef} style={{ fontFamily: LibFont("MonoSpace"), fontSize: 50, fontWeight: "bold" }} defaultValue={props.valueDisplayEdit ? props.valueDisplayEdit?.(min) : min} />
        <LibIcon name='triangle' size={15} style={{ marginLeft: -2, transform: [{ rotate: "180deg" }], textAlign: 'center' }} />
      </View>
      <View style={{ height: 100, backgroundColor: '#fff' }} >
        <FlatList
          horizontal
          onScroll={(e) => {
            const val = interpolate(e.nativeEvent.contentOffset.x, [0, max * 10], [props.range[0], max]).toFixed(0)
            valueRef.current?.setNativeProps({ text: display(val) })
            if (Number(val) != value.current) {
              value.current = Number(val)
              props.onValueChange(Number(val))
            }

          }}
          style={{ flex: 1 }}
          bounces={false}
          scrollEventThrottle={16}
          data={new Array(max).fill(0)}
          ListHeaderComponent={<View style={{ width: LibStyle.width * 0.5 }} />}
          ListFooterComponent={<View style={{ width: LibStyle.width * 0.5 }} />}
          renderItem={({ item, index }) => {
            return (
              <View style={{ justifyContent: 'center', marginBottom: 20, marginTop: 10 }} >
                <View style={{ marginHorizontal: 3, height: (((index + 1) % 5) == 0) ? 70 : 60, backgroundColor: '#222', width: 4, borderRadius: 2 }} />
              </View>
            )
          }}
        />
        <View pointerEvents='none' style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, flexDirection: 'row' }} >
          <LibGradient direction='left-to-right' colors={["rgba(255,255,255,1)","rgba(255,255,255,0.9)" ,"rgba(255,255,255,0.0)"]} style={{ width: LibStyle.width * 0.4, height: 100 }} />
          <View style={{ flex: 1 }} />
          <LibGradient direction='right-to-left' colors={["rgba(255,255,255,1)","rgba(255,255,255,0.9)" ,"rgba(255,255,255,0.0)"]} style={{ width: LibStyle.width * 0.4, height: 100 }} />
        </View>
      </View>
    </View>
  )
}