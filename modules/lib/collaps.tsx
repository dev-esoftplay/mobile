// withHooks
// noPage
import useSafeState from 'esoftplay/state';
import React, { useEffect, useLayoutEffect } from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


export interface LibCollapsArgs {
}
export interface LibCollapsProps {
  show?: boolean,
  header: (isShow: boolean) => any,
  children: any,
  onToggle?: (expanded: boolean) => void,
  style?: ViewStyle
}
export default function m(props: LibCollapsProps): any {
  const [expand, setExpand] = useSafeState(props.show)
  const translateY = useSharedValue(-10);
  const isAnimationOff = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 1,
      transform: [{ translateY: translateY.value }],
    };
  });

  useLayoutEffect(() => {
    checkIfAnimationsAreDisabled().then((isDisabled) => {
      isAnimationOff.value = isDisabled ? 1 : 0
    });
  }, [])

  useEffect(() => {
    if (expand) {
      toggleAnimation()
    }
  }, [expand])

  const toggleAnimation = () => {
    if (isAnimationOff.value) {
      translateY.value = translateY.value !== -10 ? -10 : 0
    } else {
      translateY.value = withTiming(translateY.value !== -10 ? -10 : 0, { duration: 300 }, (status) => {
        if (translateY.value == -10 && status) {
          runOnJS(setExpand)(false)
        }
      })
    }
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

const checkIfAnimationsAreDisabled = async () => {
  const value = useSharedValue(0);

  const startTime = Date.now();

  // Animate the shared value with a short duration
  await new Promise((resolve) => {
    value.value = withTiming(1, { duration: 50 }, () => {
      resolve();
    });
  });

  const elapsedTime = Date.now() - startTime;

  // If animations are disabled, the elapsed time will be very short (e.g., < 10ms)
  return elapsedTime < 10;
};