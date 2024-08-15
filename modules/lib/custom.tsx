// withHooks

import esp from 'esoftplay/esp';
import React, { useEffect, useRef } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import WebView from 'react-native-webview';


export interface LibCustomArgs {

}
export interface LibCustomProps {

}
export default function m(props: LibCustomProps): any {
	const LibIcon = useRef(esp.mod("lib/icon")).current

  const { url, title } = esp.mod("lib/navigation").getArgsAll(props)

  useEffect(() => {
    if (!String(url).startsWith("http")) {
      Linking.openURL(url)
      esp.mod("lib/navigation").back()
    }
  }, [])

  if (String(url).startsWith("http"))
    return (
      <View style={{ flex: 1 }} >
        <View style={[{ height: 60 + esp.mod("lib/style").STATUSBAR_HEIGHT, paddingTop: esp.mod("lib/style").STATUSBAR_HEIGHT, backgroundColor: "#fff", flexDirection: 'row', alignItems: 'center', marginBottom: 3 }, esp.mod("lib/style").elevation(3)]} >
          <Pressable onPress={() => esp.mod("lib/navigation").back()} style={{ height: 60, width: 60, alignItems: 'center', justifyContent: 'center' }} >
            <LibIcon name='arrow-left' />
          </Pressable>
          <Text style={{ fontWeight: "bold", marginLeft: 0 }}>{title ? title : ""}</Text>
        </View>
        <WebView
          style={{ flex: 1 }}
          source={{ uri: url }}
          startInLoadingState={true}
        />
      </View>
    )
  else
    return null
}