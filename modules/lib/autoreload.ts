import React from 'react'
import { InteractionManager } from 'react-native'

export default (() => {
  let updater = undefined
  return class m {
    static set(callback: () => void, duration?: number): void {
      if (updater != undefined) {
        clearInterval(updater)
        updater = undefined
      }
      updater = setInterval(() => {
        InteractionManager.runAfterInteractions(() => {
          callback()
        });
      }, duration || 6000)
    }
    static clear(): void {
      if (updater != undefined) {
        clearInterval(updater)
        updater = undefined
      }
    }
  }
})()