// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibTextstyle } from 'esoftplay/cache/lib/textstyle/import';
import { LibTheme } from 'esoftplay/cache/lib/theme/import';
import useGlobalState from 'esoftplay/global';

import React from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';

export interface LibProgressProps {
  show?: boolean,
  message?: string
}

export interface LibProgressState {

}

const state = useGlobalState<LibProgressProps>({
  show: false,
  message: undefined
})

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/progress.md) untuk melihat dokumentasi*/
class m extends LibComponent<LibProgressProps, LibProgressState> {

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/progress.md#show) untuk melihat dokumentasi*/
  static show(message?: string): void {
    state.set({
      show: true,
      message: message
    })
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/progress.md#hide) untuk melihat dokumentasi*/
  static hide(): void {
    state.set({ show: false, message: undefined })
  }

  render(): any {
    return <Progress />
  }
}


/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/progress.md#handleBack) untuk melihat dokumentasi*/
function handleBack(): boolean {
  state.set({ show: false, message: undefined })
  return true
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/progress.md#Progress) untuk melihat dokumentasi*/
function Progress(): any {
  const { message, show } = state.useSelector(s => s)
  if (!show) BackHandler.removeEventListener("hardwareBackPress", handleBack)
  else BackHandler.addEventListener("hardwareBackPress", handleBack)
  if (!show)
    return null
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', flex: 1 }} >
      <View style={{ backgroundColor: LibTheme._colorBackgroundCardPrimary(), padding: 10, borderRadius: 4, width: LibStyle.width - 80 }} >
        <View style={{ marginTop: 16, marginHorizontal: 10 }} >
          <View style={{ alignItems: 'center', justifyContent: 'center' }} >
            <ActivityIndicator color={LibTheme._colorPrimary()} size='large' />
            {message && <LibTextstyle textStyle="subhead" text={message || ''} style={{ textAlign: 'center', lineHeight: 20, marginTop: 20 }} />}
          </View>
        </View>
      </View>
    </View>
  )
}

export default m