// useLibs  
// noPage

import { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';


const AnimatedText = Animated.createAnimatedComponent(Text)
export default function useRenderCounter(module: string): any {
  const counter = useRef(1)
  const value = useSharedValue(0)

  useEffect(() => {
    counter.current += 1
    value.value = 1
    value.value = withDelay(1000, withTiming(0, { duration: 500 }))
  })

  const style = useAnimatedStyle(() => ({
    opacity: value.value
  }))

  return () => (
    <AnimatedText pointerEvent={'none'} style={[{ position: 'absolute', fontSize: 10, zIndex: 999, color: 'white', backgroundColor: 'black', bottom: 0, left: 0 }, style]} >{module}: {counter.current}</AnimatedText>
  )
}