// withHooks
// noPage
import useSafeState from 'esoftplay/state';
import React, { useEffect } from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, { ReduceMotion, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


export interface LibCollapsArgs {
}
export interface LibCollapsProps {
  show?: boolean,
  header: (isShow: boolean) => any,
  children: any,
  onToggle?: (expanded: boolean) => void,
  style?: ViewStyle
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/collaps.md) untuk melihat dokumentasi*/
export default function m(props: LibCollapsProps): any {
  const [expand, setExpand] = useSafeState(props.show)
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-10);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    if (expand) {
      toggleAnimation()
    }
  }, [expand])

  const toggleAnimation = () => {
    opacity.value = withTiming(opacity.value === 0 ? 1 : 0, { duration: 300, reduceMotion: ReduceMotion.Never }, (status) => {
      if (opacity.value == 0 && status) {
        runOnJS(setExpand)(false)
      }
    });
    translateY.value = withTiming(opacity.value !== 0 ? -10 : 0, { duration: 300 })
  };

  function toggle() {
    if (!expand) {
      setExpand(true)
    } else {
      toggleAnimation()
    }
    if (props.onToggle) {
      props.onToggle(!expand)
    }
  }

  return (
    <Animated.View>
      <Pressable onPress={toggle} style={{ ...props.style, zIndex: 11 }} >
        {props.header(expand)}
      </Pressable>
      {expand &&
        <Animated.View
          style={[{ paddingBottom: expand ? 10 : 0, zIndex: 10 }, animatedStyle]}>
          {props.children}
        </Animated.View>
      }
    </Animated.View>
  )
}