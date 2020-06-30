// withHooks

import React from 'react';
import { StatusBar } from 'expo-status-bar';

export interface LibStatusbarProps {
  style: "dark" | "light"
  backgroundColor?: string
}
export default function m(props: LibStatusbarProps): any {
  return (
    <StatusBar translucent style={props.style} backgroundColor={props.backgroundColor} />
  )
}