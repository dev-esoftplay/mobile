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
  const offset = useSharedValue(-LibStyle.width * 0.75)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }]
    }
  })

  useEffect(() => {
    offset.value = -LibStyle.width * 0.75
    offset.value = withRepeat(withTiming(LibStyle.width * 1.25, { duration: props.duration || 1000 }), -1, props.reverse ?? false)
  }, [])


  return (
    <View style={[{ flex: 1 }, props?.backgroundStyle]} >
      <MaskedView
        style={{ flex: 1 }}
        maskElement={
          props.children ?
            <View style={{ flex: 1 }} >
              {props.children}
            </View>
            :
            <View style={{ flex: 1, justifyContent: 'center' }} >
              <View>
                <View style={{ marginTop: 24, backgroundColor: 'black', height: LibStyle.width * 9 / 16, width: LibStyle.width }} >
                </View>
              </View>
            </View>
        }>
        <AnimatedLinearGradient
          style={[{ height: '100%', width: LibStyle.width * 3.5, alignSelf: 'center', }, animatedStyle]}
          colors={props.colors ?? ['#f1f2f3', '#f1f2f3', '#f1f2f3', '#f1f2f3', '#f1f2f3', '#f1f2f3', '#dedede', '#f1f2f3', '#f1f2f3', '#f1f2f3', '#f1f2f3', '#f1f2f3', '#f1f2f3']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 1 }}
        />
      </MaskedView>
    </View>
  )
}