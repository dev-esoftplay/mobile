// withHooks
// noPage
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibToastProperty } from 'esoftplay/cache/lib/toast/import';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export interface LibVideoArgs {

}
export interface LibVideoProps {
  code: string,
  style?: any
}
export default function m(props: LibVideoProps): any {
  const code = props.code

  if (!code) {
    LibToastProperty.show("Missing Youtube Code in Props")
  }

  return (
    <WebView
      style={[{ width: LibStyle.width, height: 9 / 16 * LibStyle.width, backgroundColor:'black' }, StyleSheet.flatten(props.style || {})]}
      useWebKit={true}
      renderLoading={() => <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor:'black' }} ><ActivityIndicator color={LibStyle.colorPrimary} /></View>}
      javaScriptEnabled={true}
      source={{ uri: "https://www.youtube.com/embed/" + props.code + "?rel=0&autoplay=0&showinfo=0&controls=1&modestbranding=1" }}
    />
  )
}