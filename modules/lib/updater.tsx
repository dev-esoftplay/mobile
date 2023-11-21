// withHooks
// noPage
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibProgress } from 'esoftplay/cache/lib/progress/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import esp from 'esoftplay/esp';
import { createTimeout } from 'esoftplay/timeout';

import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import React from 'react';
import { Alert, Pressable } from 'react-native';

export interface LibUpdaterProps {
  show: boolean
}

export function install(): void {
  const timeout = createTimeout()
  timeout.set(() => {
    Updates?.reloadAsync?.()
    timeout.clear()
  }, 100)

}

export function alertInstall(title?: string, msg?: string): void {
  Alert.alert(title || esp.lang("lib/updater", "alert_info"), msg || esp.lang("lib/updater", "alert_msg"), [{
    onPress: () => {
      install()
    },
    text: esp.lang("lib/updater", "ok")
  }], { cancelable: false })
}

export function checkAlertInstall(): void {
  check((isNew) => { if (isNew) alertInstall() })
}

export function check(callback?: (isNew: boolean) => void): void {
  if (__DEV__) {
    callback?.(false)
    return
  }
  Updates.checkForUpdateAsync().then(({ isAvailable }) => {
    if (!isAvailable) {
      callback?.(false)
      LibProgress?.hide?.()
    } else {
      Updates.fetchUpdateAsync()
        .then(({ isNew }) => {
          if (isNew && callback)
            callback?.(isNew)
        }).catch((e) => {
          Alert.alert("Update Gagal", e)
          LibProgress?.hide?.()
        })
    }
  })
}

export default function m(props: LibUpdaterProps): any {
  return (
    <>
      {
        props.show && esp.appjson().expo.updates.enabled == true &&
        <Pressable
          style={{ position: 'absolute', ...LibStyle.elevation(5), right: 20, bottom: 20, height: 50, width: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: LibStyle.colorRed }}
          onPress={() => {
            if (__DEV__) {
              Alert.alert(esp.lang("lib/updater", "alert_dev"), esp.lang("lib/updater", "alert_dev_msg"))
              return
            }
            if (Constants.appOwnership == 'expo') {
              Alert.alert(esp.lang("lib/updater", "alert_title"), esp.lang("lib/updater", "alert_expo"))
              return
            }
            LibProgress.show(esp.lang("lib/updater", "wait_check"))
            check((isNew) => {
              if (isNew) {
                LibProgress.hide()
                install()
              } else {
                LibProgress.hide()
                Alert.alert(esp.lang("lib/updater", "alert_update"), esp.lang("lib/updater", "alert_uptodate"))
              }
            })
          }}>
          <LibIcon name="cloud-download-outline" color={'white'} />
        </Pressable>
      }
    </>
  )
}