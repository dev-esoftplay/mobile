// withHooks

import React from 'react';
import { View, Alert } from 'react-native';
import { Fab } from 'native-base';
import * as Updates from 'expo-updates';
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
  if (!__DEV__)
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
        <Fab
          position="bottomRight"
          style={{ backgroundColor: LibStyle.colorRed }}
          onPress={() => {
            if (__DEV__) {
              Alert.alert('Development Mode', 'Update not working in development mode!')
              return
            }
            LibProgress.show('Sedang memeriksa versi terbaru')
            check((isNew) => {
              if (isNew) {
                LibProgress.hide()
                install()
              }
              else {
                LibProgress.hide()
                Alert.alert('App is fine', 'Your app is up-to-date')
              }
            })
          }}>
          <LibIcon name="cloud-download-outline" color={'white'} />
        </Fab>
      }
    </>
  )
}