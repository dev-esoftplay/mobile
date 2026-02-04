
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibDialog } from 'esoftplay/cache/lib/dialog/import';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibTextstyle } from 'esoftplay/cache/lib/textstyle/import';
import { LibUpdaterProperty } from 'esoftplay/cache/lib/updater/import';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import * as Application from 'expo-application';

import { BackHandler, ImageBackground, Linking, Platform, TouchableOpacity } from 'react-native';
export interface LibVersionProps {

}
export interface LibVersionState {

}

const isFirstOpen = useGlobalState(1, { persistKey: "lib/version.isFirstOpen", inFastStorage: true, loadOnInit: true })

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/version.md) untuk melihat dokumentasi*/
export default class m extends LibComponent<LibVersionProps, LibVersionState> {

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/version.md#appVersion) untuk melihat dokumentasi*/
  static appVersion(): string {
    let version: any = Application.nativeBuildVersion
    return version
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/version.md#showDialog) untuk melihat dokumentasi*/
  static showDialog(title: string, message: string, link: string, onOk: (link: string) => void, onCancel: () => void): void {
    LibDialog.confirm(title, message, esp.lang("lib/version", "update"), () => onOk(link), esp.lang("lib/version", "skip"), onCancel)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/version.md#closeApp) untuk melihat dokumentasi*/
  static closeApp(): void {
    if (Platform.OS == 'ios') {
      // Updates.reload()
    } else {
      BackHandler.exitApp()
    }
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/version.md#toStore) untuk melihat dokumentasi*/
  static toStore(link: string): void {
    Linking.openURL(link)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/version.md#onDone) untuk melihat dokumentasi*/
  static onDone(res: any, msg: string): void {
    const { title, version, android, ios, version_publish } = res

    function isAvailableNewVersion(newVersion: string): boolean {
      let oldVersion = m.appVersion()
      return Number(newVersion) > Number(oldVersion)
    }

    if (!__DEV__)
      if (isAvailableNewVersion(version)) {
        LibNavigation.backToRoot()
        LibNavigation.replace("lib/version", { res, msg: msg == 'success' ? 'Update to a new version now' : msg })
      } else {
        const currentVersion = esp.config('publish_id')
        // Alert.alert("ForceUpdate", JSON.stringify({ res, isFirstOpen: isFirstOpen.get() }, undefined, 2))
        if (((currentVersion < version_publish) || (isFirstOpen.get() == 1 && res.app_update == 1)) && !__DEV__) {
          isFirstOpen.set(0)
          LibNavigation.reset("lib/version_view")
          LibUpdaterProperty.check((isNew) => {
            if (isNew) {
              LibUpdaterProperty.install()
            } else {
              LibNavigation.reset()
            }
          })
        }
      }
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/version.md#check) untuk melihat dokumentasi*/
  static check(): void {
    new LibCurl("public_version", null, m.onDone)
  }

  render(): any {
    const { res, msg } = LibNavigation.getArgsAll<any>(this.props)
    let title, version, android, ios
    if (res) {
      title = res.title
      version = res.version
      android = res.android
      ios = res.ios
    }
    const link = Platform.OS == 'ios' ? ios : android
    return (
      <ImageBackground source={esp.assets("splash.png")} blurRadius={100} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderStartColor: 'white', paddingHorizontal: 17 }} >
        <LibIcon.SimpleLineIcons name="info" size={60} />
        <LibTextstyle textStyle="headline" text={title || 'A new version is available'} style={{ textAlign: 'center', marginTop: 10 }} />
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