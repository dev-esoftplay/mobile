// withHooks
// noPage

import { LibStyle, useGlobalState } from 'esoftplay';
import React, { useCallback, useEffect, useRef } from 'react';
import { Text } from 'react-native';
import Animated, { EasingNode } from 'react-native-reanimated';
;

export interface LibToastProps {

}

const initState = {
  message: undefined,
  timeout: 3000
}

const state = useGlobalState(initState)

let _timeout: any = undefined

export function hide(): void {
  state.set(initState)
}

export function show(message: string, timeout?: number): void {
  state.set({
    message: message,
    timeout: timeout || initState.timeout
  })
  if (_timeout) {
    clearTimeout(_timeout)
    _timeout = undefined
  }
  _timeout = setTimeout(() => {
    hide()
  }, timeout || initState.timeout);
}

export default function m(props: LibToastProps): any {
  const data = state.useSelector(s => s)
  // if (!data.message) return null

  const animatable = useRef(new Animated.Value(0)).current

  const inv = animatable.interpolate({
    inputRange: [0, 1],
    outputRange: [-(LibStyle.STATUSBAR_HEIGHT + 300), 0],
  })
  const op = animatable.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1],
  })

  const showHide = useCallback((show: boolean) => {
    Animated.timing(animatable, {
      toValue: show ? 1 : 0,
      duration: 500,
      easing: EasingNode.linear
    }).start()
  }, [data])

  useEffect(() => {
    showHide(data?.message)
  }, [data])

  return (
    <Animated.View style={{ position: 'absolute', top: LibStyle.STATUSBAR_HEIGHT + 70, left: 0, right: 0, transform: [{ translateY: inv }], marginVertical: 4, marginHorizontal: 13, borderRadius: 13, borderWidth: 1, borderColor: '#c4c4c4', opacity: op, backgroundColor: '#333', padding: 16, flex: 1 }} >
      <Text style={{ fontSize: 13, fontWeight: "bold", fontStyle: "normal", letterSpacing: 0, textAlign: "center", color: 'white' }} >{String(data?.message || '')}</Text>
    </Animated.View>
  )
}