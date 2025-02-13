// noPage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import esp from 'esoftplay/esp';
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from 'react-native-webview';
const config = esp.config()
const { colorPrimary } = LibStyle

export interface LibSocialloginProps {
  url?: string,
  onResult: (userData: any) => void
}
export interface LibSocialloginState {

}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/sociallogin.md) untuk melihat dokumentasi*/
export default class m extends LibComponent<LibSocialloginProps, LibSocialloginState> {
  props: LibSocialloginProps

  constructor(props: LibSocialloginProps) {
    super(props);
    this.props = props
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/sociallogin.md#setUser) untuk melihat dokumentasi*/
  static setUser(userData: any): void {
    AsyncStorage.setItem(config.domain + "_user", JSON.stringify(userData));
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/sociallogin.md#delUser) untuk melihat dokumentasi*/
  static delUser(): void {
    AsyncStorage.removeItem(config.domain + "_user")
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/sociallogin.md#getUser) untuk melihat dokumentasi*/
  static getUser(callback?: (userData: any) => void): Promise<any> {
    return new Promise((r, j) => {
      AsyncStorage.getItem(config.domain + "_user").then((userData: any) => {
        if (userData) {
          if (callback) callback(JSON.parse(userData));
          r(JSON.parse(userData));
        } else {
          r(null)
        }
      })
    })
  }
  render(): any {
    var { url, onResult } = this.props
    if (!url) {
      url = LibNavigation.getArgs(this.props, "url");
    }
    return (
      <View style={{ flex: 1 }} >
        <WebView
          style={{ flex: 1 }}
          startInLoadingState={true}
          renderLoading={() => <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }} ><ActivityIndicator color={colorPrimary} /></View>}
          javaScriptEnabled={true}
          userAgent={"Mozilla/5.0 (X11; Linux i686; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 SeaMonkey/2.7.1"}
          source={{ uri: url }}
          onMessage={(e: any) => {
            var data = e.nativeEvent.data
            if (data) {
              m.setUser(data)
              onResult(JSON.parse(data))
            }
          }}
        />
      </View>
    )
  }
}
