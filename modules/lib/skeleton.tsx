// withHooks

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { LibStyle } from 'esoftplay';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';


export interface LibSkeletonArgs {

}
export interface LibSkeletonProps {
  duration?: number
  reverse?: boolean,
  colors?: string[],
  backgroundStyle?: any,
  children?: any
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)
export default function m(props: LibSkeletonProps): any {
  const offset = useSharedValue(-LibStyle.width * 0.5)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }]
    }
  })

  useEffect(() => {
    offset.value = -LibStyle.width * 0.5
    offset.value = withRepeat(withTiming(LibStyle.width * 0.5, { duration: props.duration || 800 }), -1, props.reverse ?? true)
  }, [])


  return (
    <View style={[{ flex: 1 }, props?.backgroundStyle]} >
      <MaskedView
        style={{ flex: 1 }}
        maskElement={
          props.children ??
          <View style={{ flex: 1, justifyContent: 'center' }} >
            <View>
              <View style={{ marginTop: 24, backgroundColor: 'black', height: LibStyle.width * 9 / 16, width: LibStyle.width }} >
              </View>
            </View>
          </View>
        }>
        <AnimatedLinearGradient
          style={[{ height: '100%', width: LibStyle.width * 2, alignSelf: 'center', }, animatedStyle]}
          colors={props.colors ?? ['#f1f2f3', '#c5c5c5', '#f1f2f3']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 1 }}
        />
      </MaskedView>
    </View>
  )
}

10
