// noPage

import React from 'react';
import { View, ActivityIndicator, BackHandler } from 'react-native';
import { LibComponent, LibTheme, LibStyle, LibTextstyle, useGlobalState } from 'esoftplay';

export interface LibProgressProps {
  show?: boolean,
  message?: string
}

export interface LibProgressState {

}

const state = useGlobalState({
  show: false,
  message: undefined
})

class m extends LibComponent<LibProgressProps, LibProgressState>{

  static show(message?: string): void {
    state.set({
      show: true,
      message: message
    })
  }

  static hide(): void {
    state.set({ show: false, message: undefined })
  }

  render(): any {
    return <Progress />
  }
}


function handleBack(): boolean {
  return true
}

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