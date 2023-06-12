
import { esp } from 'esoftplay';
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibDialog } from 'esoftplay/cache/lib/dialog/import';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibTextstyle } from 'esoftplay/cache/lib/textstyle/import';
import { LibUpdaterProperty } from 'esoftplay/cache/lib/updater/import';

import Constants from 'expo-constants';
import React from 'react';
import { BackHandler, ImageBackground, Linking, Platform, TouchableOpacity } from 'react-native';
export interface LibVersionProps {

}
export interface LibVersionState {

}

export default class m extends LibComponent<LibVersionProps, LibVersionState> {

  static appVersion(): string {
    let version: any = (Platform.OS == 'android' ? Constants?.manifest?.android?.versionCode : Constants?.manifest?.ios?.buildNumber)
    return version
  }

  static showDialog(title: string, message: string, link: string, onOk: (link: string) => void, onCancel: () => void): void {
    LibDialog.confirm(title, message, esp.lang("lib/version", "update"), () => onOk(link), esp.lang("lib/version", "skip"), onCancel)
  }

  static closeApp(): void {
    if (Platform.OS == 'ios') {
      // Updates.reload()
    } else {
      BackHandler.exitApp()
    }
  }

  static toStore(link: string): void {
    Linking.openURL(link)
  }

  static onDone(res: any, msg: string): void {
    const { title, version, android, ios, isForceUpdate } = res

    function isAvailableNewVersion(newVersion: string): boolean {
      let oldVersion = m.appVersion()
      return newVersion > oldVersion
    }
    if (isAvailableNewVersion(version)) {
      LibNavigation.backToRoot()
      LibNavigation.replace("lib/version", { res, msg: msg == 'success' ? esp.lang("lib/version", "update_now") : msg })
    }
    if (isForceUpdate == 1) {
      LibUpdaterProperty.check((isNew) => { if (isNew) LibUpdaterProperty.install() })
    }
  }
  static check(): void {
    new LibCurl("public_version", null, m.onDone)
  }

  render(): any {
    const { res: { title, version, android, ios }, msg } = LibNavigation.getArgsAll<any>(this.props)
    const link = Platform.OS == 'ios' ? ios : android
    return (
      <ImageBackground source={esp.assets("splash.png")} blurRadius={100} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderStartColor: 'white', paddingHorizontal: 17 }} >
        <LibIcon.SimpleLineIcons name="info" size={60} />
        <LibTextstyle textStyle="headline" text={title || esp.lang("lib/version", "version_available")} style={{ textAlign: 'center', marginTop: 10 }} />
        <LibTextstyle textStyle="callout" text={msg} style={{ textAlign: 'center', marginTop: 10, color: '#333' }} />
        <TouchableOpacity
          onPress={() => { Linking.openURL(link) }}
          style={{ marginTop: 20, borderRadius: 10, paddingHorizontal: 17, paddingVertical: 10, backgroundColor: LibStyle.colorPrimary }} >
          <LibTextstyle textStyle="body" text={esp.lang("lib/version", "btn_update")} />
        </TouchableOpacity>
      </ImageBackground>
    )
  }
}