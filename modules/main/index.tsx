// withHooks

import esp from 'esoftplay/esp';
import React from 'react';
import { Text, View } from 'react-native';

export interface MainIndexArgs {

}
export interface MainIndexProps {

}
export default function m(props: MainIndexProps): any {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
      <Text>{esp.lang("main/index", "helo_msg")}</Text>
    </View>
  )
}