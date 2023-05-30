// withHooks

import { LibStyle } from 'esoftplay/cache/lib/style/import';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';


export interface LibLoadingArgs {

}
export interface LibLoadingProps {

}
export default function m(props: LibLoadingProps): any {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
      <ActivityIndicator color={LibStyle.colorPrimary} size={'large'} />
    </View>
  )
}