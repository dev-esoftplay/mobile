

import React from 'react'
import { esp, LibCurl, LibDialog, LibNavigation, LibComponent, LibIcon, LibStyle, LibTextstyle, LibUtils } from 'esoftplay'
import { Linking, BackHandler, Platform, View, TouchableOpacity } from 'react-native'

export interface LibVersionProps {

}
export interface LibVersionState {

}

export default class m extends LibComponent<LibVersionProps, LibVersionState> {

  static appVersion(): string {
    let version: any = esp.appjson().expo.version
    return version
  }

  static isAutoUpdate(): boolean {
    let enabled: any = esp.appjson().expo.updates.enabled
    return enabled == true
  }

  static showDialog(title: string, message: string, link: string, onOk: (link: string) => void, onCancel: () => void): void {
    LibDialog.confirm(title, message, 'Update', () => onOk(link), 'Nanti', onCancel)
  }

  static closeApp(): void {
    if (Platform.OS == 'ios') {
      // Updates.reload()
    } else {
      BackHandler.exitApp()
    }
  }

  static toStore(link: string): void {
    Linking.canOpenURL(link) && Linking.openURL(link)
  }

  static onDone(res: any, msg: string): void {
    const { title, version, android, ios } = res

    function isAvailableNewVersion(newVersion: string): boolean {
      let oldVersion = m.appVersion()
      return newVersion > oldVersion
    }

    if (isAvailableNewVersion(version)) {
      LibNavigation.backToRoot()
      LibNavigation.replace("lib/version", { res, msg: msg == 'success' ? 'Update to a new version now' : msg })
    }

  }
  static check(): void {
    new LibCurl("public_version", null, m.onDone)
  }

  render(): any {
    const { res: { title, version, android, ios }, msg } = LibUtils.getArgsAll(this.props)
    const link = Platform.OS == 'ios' ? ios : android
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderStartColor: 'white', paddingHorizontal: 17 }} >
        <LibIcon.SimpleLineIcons name="info" size={60} />
        <LibTextstyle textStyle="headline" text={title || 'A new version is available'} style={{ textAlign: 'center', marginTop: 10 }} />
        <LibTextstyle textStyle="callout" text={LibUtils.ucwords(msg)} style={{ textAlign: 'center', marginTop: 10, color: '#888' }} />
        <TouchableOpacity
          onPress={() => { Linking.canOpenURL(link) && Linking.openURL(link) }}
          style={{ marginTop: 20, borderRadius: 10, paddingHorizontal: 17, paddingVertical: 10, backgroundColor: LibStyle.colorPrimary }} >
          <LibTextstyle textStyle="body" text="Update Sekarang" />
        </TouchableOpacity>
      </View>
    )
  }
}