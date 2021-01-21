// withHooks

import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { LibStyle, esp } from 'esoftplay';
import Animated, { Easing } from 'react-native-reanimated'

export interface LibToastProps {

}

const initState = {
  message: undefined,
  timeout: 2500
}

export function reducer(state: any, action: any): any {
  if (state == undefined) state = initState
  const actions: any = {
    "lib_toast_show": {
      ...state,
      ...action.payload
    },
    "lib_toast_hide": {
      ...state,
      ...initState
    }
  }
  const _action = actions[action.type]
  return _action ? _action : state
}
let _timeout: any = undefined

export function hide(): void {
  esp.dispatch({ type: 'lib_toast_hide' })
}

export function show(message: string, timeout?: number): void {
  esp.dispatch({
    type: 'lib_toast_show',
    payload: {
      message: message,
      timeout: timeout || initState.timeout
    }
  })
  if (_timeout) {
    clearTimeout(_timeout)
    _timeout = undefined
  }
  _timeout = setTimeout(() => {
    esp.dispatch({ type: 'lib_toast_hide' })
  }, timeout || initState.timeout);
}

export default function m(props: LibToastProps): any {
  const data = useSelector((state: any) => state.lib_toast)
  // if (!data.message) return null

  const animatable = useRef(new Animated.Value(0)).current

  const inv = animatable.interpolate({
    inputRange: [0, 1],
    outputRange: [-(LibStyle.STATUSBAR_HEIGHT + 70), 0],
  })
  const op = animatable.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  })

  const showHide = useCallback((show: boolean) => {
    Animated.timing(animatable, {
      toValue: show ? 1 : 0,
      duration: 300,
      easing: Easing.linear
    }).start()
  }, [data])

  useEffect(() => {
    showHide(data?.message)
  }, [data])

  return (
    <Animated.View style={{ position: 'absolute', top: LibStyle.STATUSBAR_HEIGHT + 70, left: 0, right: 0, transform: [{ translateY: inv }], marginVertical: 4, marginHorizontal: 13, borderRadius: 13, borderWidth: 1, borderColor: '#ddd', opacity: op, backgroundColor: 'rgba(255,255,255,0.7)', padding: 16, flex: 1 }} >
      <Text style={{ fontSize: 13, fontWeight: "bold", fontStyle: "normal", letterSpacing: 0, textAlign: "center", color: '#333' }} >{data?.message}</Text>
    </Animated.View>
  )
}