// withHooks
// noPage
import esp from 'esoftplay/esp';

import React from 'react';
import { ImageBackground } from "react-native";

export interface UserLoadingArgs {

}
export interface UserLoadingProps {

}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/loading.md) untuk melihat dokumentasi*/
export default function m(props: UserLoadingProps): any {
  return <ImageBackground source={esp.assets('splash.gif') || esp.assets('splash.png')} style={{ flex: 1 }} />
}