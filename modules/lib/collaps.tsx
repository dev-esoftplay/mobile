// withHooks
// noPage

import { useSafeState } from 'esoftplay';
import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';


export interface LibCollapsArgs {
}
export interface LibCollapsProps {
  show?: boolean,
  header: (isShow: boolean) => any,
  children: any,
  style?: any
}
export default function libcollaps(props: LibCollapsProps): any {
  const animHeight = useSharedValue(-1)
  const bodyHeight = useSharedValue(1)
  const [expand, setExpand] = useSafeState(props.show)

  const heightStyle = useAnimatedStyle(() => {
    return {
      overflow: 'hidden',
      height: interpolate(animHeight.value,
        [0, 1, 2],
        [0, bodyHeight.value, bodyHeight.value * 2]),
      opacity: interpolate(animHeight.value,
        [-1, 0],
        [0, 1])
    }
  })

  const toggle = useCallback(() => {
    animHeight.value = animHeight.value == 0 ? withSpring(1) : withTiming(0)
    setExpand(animHeight.value != 1)
  }, [])

  return (
    <Animated.View style={{ overflow: 'hidden' }} >
      <Pressable onPress={toggle} >
        {props.header(expand)}
      </Pressable>
      <Animated.View
        onLayout={({ nativeEvent: { layout: { height } } }) => {
          if (height && animHeight.value == -1) {
            bodyHeight.value = height + 5
            animHeight.value = props.show ? 1 : 0
          }
        }}
        style={[heightStyle]}>
        {props.children}
      </Animated.View>
    </Animated.View>
  )
}