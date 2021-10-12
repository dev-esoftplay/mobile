// noPage

import MaskedView from '@react-native-masked-view/masked-view';
import { LibComponent, LibStyle } from 'esoftplay';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';


export interface LibSkeletonProps {

}
export interface LibSkeletonState {

}
export interface LibSkeletonStatic {
  size: number
}


export default class m extends LibComponent<LibSkeletonProps, LibSkeletonState> {
  constructor(props: LibSkeletonProps) {
    super(props);
  }

  static BoxFull(props: LibSkeletonStatic): any {
    return <View style={{ margin: '2.5%', marginVertical: 8, alignSelf: 'center', backgroundColor: 'black', height: props.size, width: '95%', borderRadius: 10 }} />
  }

  static BoxFlex(props: LibSkeletonStatic): any {
    return (<View style={{ margin: '2.5%', marginVertical: 8, backgroundColor: 'black', flexGrow: 1, height: props.size, borderRadius: 10 }} />)
  }

  static BoxHalf(props: LibSkeletonStatic): any {
    return <View style={{ margin: '2.5%', marginVertical: 8, backgroundColor: 'black', height: props.size, width: '45%', borderRadius: 10 }} />
  }

  static Box(props: LibSkeletonStatic): any {
    return <View style={{ margin: '2.5%', marginVertical: 8, backgroundColor: 'black', height: props.size, width: props.size, borderRadius: 10 }} />
  }

  static Circle(props: LibSkeletonStatic): any {
    return <View style={{ margin: '2.5%', marginVertical: 8, backgroundColor: 'black', height: props.size, width: props.size, borderRadius: props.size * 0.5 }} />
  }

  render(): any {
    return (
      <Skeleton {...this.props} />
    )
  }
}

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
function Skeleton(props: LibSkeletonProps): any {
  const offset = useSharedValue(-LibStyle.width * 0.75)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }]
    }
  })

  useEffect(() => {
    offset.value = -LibStyle.width * 0.75
    offset.value = withRepeat(withTiming(LibStyle.width * 0.5, { duration: props.duration || 1000 }), -1, props.reverse ?? false)
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