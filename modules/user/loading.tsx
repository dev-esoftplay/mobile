// withHooks
// noPage

import React from 'react';
import { ImageBackground } from "react-native";
import { esp } from 'esoftplay'

export interface UserLoadingArgs {

}
export interface UserLoadingProps {

}
export default function m(props: UserLoadingProps): any {
  return <ImageBackground source={esp.assets('splash.gif') || esp.assets('splash.png')} style={{ flex: 1 }} />
}