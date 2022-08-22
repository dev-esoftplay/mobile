// withHooks
// noPage

import { ChattingFirebase, esp, LibDialog, LibImage, LibNet_status, LibProgress, LibStyle, LibToast, LibUpdaterProperty, LibVersion, LibWorker, LibWorkloop, LibWorkview, UseDeeplink, UserClass, UserHook, UserLoading, UserRoutes, useSafeState, _global } from 'esoftplay';
import * as Font from "expo-font";
import React, { useEffect, useLayoutEffect } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navs from '../../cache/navs';

export interface UserIndexProps {

}

export interface UserIndexState {
  loading: boolean
}

function setFonts(): Promise<void> {
  let fonts: any = {}
  let fontsConfig = esp.config("fonts")
  if (fontsConfig) {
    Object.keys(esp.config("fonts")).forEach((key) => {
      fonts[key] = esp.assets('fonts/' + fontsConfig[key])
    })
  }
  return new Promise((r, j) => {
    Font.loadAsync(fonts).then(() => r())
  })
}


function isWorkerReady(onReady: () => void): void {
  if (_global.LibWorkerReady < 1) {
    setTimeout(() => isWorkerReady(onReady), 10)
  } else {
    onReady()
  }
}


export default function UserIndex(props: UserIndexProps): any {
  const [loading, setLoading] = useSafeState(true)
  const user = UserClass.state().useSelector(s => s)
  const ready = React.useRef(0)
  UseDeeplink()
  //@ts-ignore
  const initialState = __DEV__ ? _global.nav__state : undefined

  function handler(currentState: any): void {
    //@ts-ignore
    if (__DEV__) {
      _global.nav__state = currentState
    }
    UserRoutes.set(currentState)
  }

  useLayoutEffect(() => {
    let limitReady = 3
    if (Platform.OS == 'android') {
      if (Platform.Version <= 22) {
        limitReady = 2
      }
    }

    if (limitReady == 3) {
      isWorkerReady(() => {
        ready.current += 1
        if (ready.current >= limitReady) {
          setLoading(false)
        }
      })
    }
    
    (async () => {
      await setFonts()
      ready.current += 1
      if (ready.current >= limitReady) {
        setLoading(false)
      }
    })()
    
    UserClass.isLogin(async () => {
      ready.current += 1
      if (ready.current >= limitReady) {
        setLoading(false)
      }
    })

    if (esp.config('firebase').hasOwnProperty('apiKey')) {
      try {
        if (ChattingFirebase)
          ChattingFirebase?.signInAnonymously?.();
      } catch (error) {

      }
    }
    
    LibUpdaterProperty.check((isNew) => { })
  }, [])

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        LibVersion.check()
      }, 0);
    }
  }, [loading])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <LibWorker />
        <LibWorkview />
        <LibWorkloop />
        {
          loading ?
            <UserLoading />
            :
            <Navs user={user} initialState={initialState} handler={handler} />
        }
        <LibNet_status />
        <LibDialog style={'default'} />
        <LibImage />
        <LibProgress />
        <UserHook />
        <LibToast />
      </View>
      <View style={{ backgroundColor: LibStyle.colorNavigationBar || 'white', height: LibStyle.isIphoneX ? 35 : 0 }} />
    </GestureHandlerRootView>
  )
}

