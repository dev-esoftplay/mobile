// withHooks
// noPage

import { StatusBar } from 'expo-status-bar';
import React from 'react';

export interface LibStatusbarProps {
  style: "dark" | "light"
  backgroundColor?: string
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/statusbar.md) untuk melihat dokumentasi*/
export default function m(props: LibStatusbarProps): any {
  return (
    <StatusBar translucent style={props.style} backgroundColor={props.backgroundColor} />
  )
}