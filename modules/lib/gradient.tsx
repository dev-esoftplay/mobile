// withHooks
// noPage
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface LibGradientArgs {

}
export interface LibGradientProps {
  style?: StyleProp<ViewStyle>,
  children?: any,
  direction: "top-to-bottom" | "bottom-to-top" | "left-to-right" | "right-to-left" | "top-left-to-bottom-right" | "bottom-right-to-top-left" | "top-right-to-bottom-left" | "bottom-left-to-top-right",
  colors: string[]
}
const direction = {
  "top-to-bottom": {
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 }
  },
  "bottom-to-top": {
    start: { x: 0.5, y: 1 },
    end: { x: 0.5, y: 0 }
  },
  "left-to-right": {
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 }
  },
  "right-to-left": {
    start: { x: 1, y: 0.5 },
    end: { x: 0, y: 0.5 }
  },
  "top-left-to-bottom-right": {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  },
  "bottom-right-to-top-left": {
    start: { x: 1, y: 1 },
    end: { x: 0, y: 0 }
  },
  "top-right-to-bottom-left": {
    start: { x: 1, y: 0 },
    end: { x: 0, y: 1 }
  },
  "bottom-left-to-top-right": {
    start: { x: 0, y: 1 },
    end: { x: 1, y: 0 }
  }
};

export default function m(props: LibGradientProps): any {
  return (
    <LinearGradient
      colors={props.colors}
      style={props.style}
      {...direction[props.direction]} >
      {props?.children}
    </LinearGradient>
  )
}