// noPage

import { InteractionManager } from 'react-native'

export default (() => {
  let updater = undefined
  return {
    set(callback: () => void, duration?: number): void {
      if (updater != undefined) {
        clearInterval(updater)
        updater = undefined
      }
      updater = setInterval(() => {
        InteractionManager.runAfterInteractions(() => {
          callback()
        });
      }, duration || 6000)
    },
    clear(): void {
      if (updater != undefined) {
        clearInterval(updater)
        updater = undefined
      }
    }
  }
})()