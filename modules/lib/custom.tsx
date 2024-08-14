// withHooks

import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import React, { useEffect } from 'react';
import { Linking, View } from 'react-native';
import WebView from 'react-native-webview';


export interface LibCustomArgs {

}
export interface LibCustomProps {

}
export default function m(props: LibCustomProps): any {
  const { url } = LibNavigation.getArgsAll(props)

  useEffect(() => {
    if (!String(url).startsWith("http")) {
      Linking.openURL(url)
    }
  }, [])

  if (String(url).startsWith("http"))
    return (
      <View style={{ flex: 1 }} >
        <WebView
          style={{ flex: 1 }}
          source={{ uri: url }}
        />
      </View>
    )
  else
    return null
}