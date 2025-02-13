// withHooks

import { LibTextstyle } from 'esoftplay/cache/lib/textstyle/import';
import esp from 'esoftplay/esp';
import { useTimeout } from 'esoftplay/timeout';
import * as Updates from 'expo-updates';
import React, { useEffect } from 'react';
import { ActivityIndicator, ImageBackground, View } from 'react-native';

export interface LibVersion_viewArgs {

}
export interface LibVersion_viewProps {

}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/version_view.md) untuk melihat dokumentasi*/
export default function m(props: LibVersion_viewProps): any {
  const timeout = useTimeout()
  useEffect(() => {
    timeout(() => {
      Updates.reloadAsync()
    }, 15000);
  }, [])

  return (
    <ImageBackground source={esp.assets('splash.png')} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
        <LibTextstyle style={{ textAlign: 'center' }} textStyle='headline' text={esp.lang("lib/version_view", "msg")} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
        <ActivityIndicator size={'large'} />
      </View>
    </ImageBackground>
  )
}