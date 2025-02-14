// noPage
// withObject
import { InteractionManager } from 'react-native'

let updater: any
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/autoreload.md) untuk melihat dokumentasi*/
export default {
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/autoreload.md#setcallback---void-duration-number-void) untuk melihat dokumentasi*/
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
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/autoreload.md#clear-void) untuk melihat dokumentasi*/
  clear(): void {
    if (updater != undefined) {
      clearInterval(updater)
      updater = undefined
    }
  }
}