import React from 'react'
import { InteractionManager } from 'react-native'
import { LibAutoreload_dataProperty } from 'esoftplay'

export default class m {
  static set(callback: () => void, duration?: number): void {

    if (LibAutoreload_dataProperty.libAutoreloadData.updater != undefined) {
      clearInterval(LibAutoreload_dataProperty.libAutoreloadData.updater)
      LibAutoreload_dataProperty.libAutoreloadData.updater = undefined
    }
    LibAutoreload_dataProperty.libAutoreloadData.updater = setInterval(() => {
      InteractionManager.runAfterInteractions(() => {
        callback()
      });
    }, duration || 6000)
  }
  static clear(): void {

    if (LibAutoreload_dataProperty.libAutoreloadData.updater != undefined) {
      clearInterval(LibAutoreload_dataProperty.libAutoreloadData.updater)
      LibAutoreload_dataProperty.libAutoreloadData.updater = undefined
    }
  }
}