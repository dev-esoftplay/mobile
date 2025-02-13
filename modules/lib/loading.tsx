// withHooks
// noPage
import esp from 'esoftplay/esp';
import React, { useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';


export interface LibLoadingArgs {

}
export interface LibLoadingProps {

}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/loading.md) untuk melihat dokumentasi*/
export default function m(props: LibLoadingProps): any {
  const LibStyle = useRef(esp.mod("lib/style")).current
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
      <ActivityIndicator color={LibStyle.colorPrimary} size={'large'} />
    </View>
  )
}