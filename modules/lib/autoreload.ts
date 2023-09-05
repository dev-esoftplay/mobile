// noPage
// withObject
import { InteractionManager } from 'react-native'

let updater: any
export default {
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