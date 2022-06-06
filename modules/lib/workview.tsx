// withHooks
// noPage

import { esp, LibWorker, _global } from 'esoftplay';
import React from 'react';
import { Platform, View } from 'react-native';
import WebView from 'react-native-webview';

export interface LibWorkviewArgs {

}
export interface LibWorkviewProps {

}
export default function m(props: LibWorkviewProps): any {
  if (Platform.OS == 'android')
    if (Platform.Version <= 22) {
      return null
    }
  return (
    <View style={{ height: 0, width: 0 }} >
      <WebView
        ref={_global.LibWorkerBase}
        style={{ width: 0, height: 0 }}
        javaScriptEnabled={true}
        injectedJavaScript={`\nwindow.ReactNativeWebView.postMessage("BaseWorkerIsReady")\n` + _global.injectedJavaScripts.join('\n') + '\ntrue;'}
        originWhitelist={["*"]}
        source={{ uri: esp.config("protocol") + "://" + esp.config("domain") + esp.config("uri") + "dummyPageToBypassCORS" }}
        onMessage={LibWorker.onMessage('BaseWorkerIsReady')}
      />
    </View>
  )
}