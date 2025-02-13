// withHooks

import useSafeState from 'esoftplay/state';
import React, { ReactElement } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { Extrapolation, interpolate, runOnJS, SharedValue, useAnimatedReaction, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';


export interface LibFadescrollArgs {

}

export interface LibFadescrollProps {
  scrollController: SharedValue<number>,
  style?: ViewStyle,
  children?: ReactElement,
  interpolateOpacity: number[],
  interpolateScroll: number[],
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/fadescroll.md) untuk melihat dokumentasi*/
export default function m(props: LibFadescrollProps): any {
  let opacity = useSharedValue(0)
  const [pointerEvents, setPointerEvents] = useSafeState<any>('none')
  const { scrollController, interpolateScroll, interpolateOpacity } = props

  // Animated style for opacity based on external scrollController value
  const animatedStyle = useAnimatedStyle(() => {
    opacity.value = interpolate(
      scrollController.value,
      interpolateScroll,
      interpolateOpacity,
      Extrapolation.CLAMP
    );

    return { opacity: opacity.value };
  });

  useAnimatedReaction(
    () => opacity.value,
    (currentValue) => {
      runOnJS(setPointerEvents)(currentValue == 1 ? 'auto' : 'none');
    },
    []
  );

  return (
    <Animated.View style={[props.style, animatedStyle]} pointerEvents={pointerEvents}>
      {props.children}
    </Animated.View>
  );
}
