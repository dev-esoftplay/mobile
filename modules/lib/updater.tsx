// withHooks
// noPage

import React from 'react';
import { Alert, Pressable } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants'
import { LibStyle, LibProgress, esp, LibIcon } from 'esoftplay';

export interface LibUpdaterProps {
  show: boolean
}

export function install(): void {
  Updates.reloadAsync()
}

export function alertInstall(title?: string, msg?: string): void {
  Alert.alert(title || 'Informasi', msg || 'Pembaharuan berhasil diinstall', [{
    onPress: () => {
      install()
    },
    text: 'Ok'
  }], { cancelable: false })
}

export function checkAlertInstall(): void {
  check((isNew) => { if (isNew) alertInstall() })
}

export function check(callback: (isNew: boolean) => void): void {
  if (__DEV__) {
    callback(false)
    return
  }
  Updates.checkForUpdateAsync().then(({ isAvailable }) => {
    if (!isAvailable) {
      callback(false)
      LibProgress.hide()
    } else {
      Updates.fetchUpdateAsync().then(({ isNew }) => {
        callback(isNew)
      }).catch((e) => {
        LibProgress.hide()
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
              Alert.alert('Development Mode', 'Update not working in development mode!')
              return
            }
            if (Constants.appOwnership == 'expo') {
              Alert.alert('App is fine', 'Your app is up-to-date')
              return
            }
            LibProgress.show('Sedang memeriksa versi terbaru')
            check((isNew) => {
              if (isNew) {
                LibProgress.hide()
                install()
              } else {
                LibProgress.hide()
                Alert.alert('App is fine', 'Your app is up-to-date')
              }
            })
          }}>
          <LibIcon name="cloud-download-outline" color={'white'} />
        </Pressable>
      }
    </>
  )
}