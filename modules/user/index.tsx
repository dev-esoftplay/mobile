// withHooks
// noPage

import { esp, LibDialog, LibImage, LibNet_status, LibProgress, LibStyle, LibToast, LibUpdaterProperty, LibVersion, LibWorker, LibWorkloop, LibWorkview, UseDeeplink, UserClass, UserLoading, UserMain, UserRoutes, useSafeState, _global } from 'esoftplay';
import * as Font from "expo-font";
import firebase from 'firebase';
import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
//@ts-ignore
import Navs from "../../cache/navs";

export interface UserIndexProps {

}

export interface UserIndexState {
  loading: boolean
}

function setFonts(): Promise<void> {
  let fonts: any = {
    "Roboto": require("../../assets/Roboto.ttf"),
    "Roboto_medium": require("../../assets/Roboto_medium.ttf"),
    "digital": require("../../assets/digital.ttf")
  }
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


export default function m(props: UserIndexProps): any {
  const [loading, setLoading] = useSafeState(true)
  const user = UserClass.state().useSelector(s => s)
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

  useMemo(() => {
    if (esp.config('firebase').hasOwnProperty('apiKey')) {
      if (!firebase.apps.length) {
        firebase.initializeApp(esp.config('firebase'));
        firebase.auth().signInAnonymously()
      }
    }
    UserClass.isLogin(async () => {
      await setFonts()
      LibUpdaterProperty.check((isNew) => {
        if (isNew) {
          LibUpdaterProperty.install()
        } else {
          setLoading(false)
        }
      })
    })
  }, [])

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        LibVersion.check()
      }, 0);
    }
  }, [loading])

  if (loading) return <UserLoading />
  return (
    <>
      <View style={{ flex: 1 }}>
        <LibWorker />
        <LibWorkview />
        <LibWorkloop />
        <Navs user={user} initialState={initialState} handler={handler} />
        <LibNet_status />
        <LibDialog style={'default'} />
        <LibImage />
        <LibProgress />
        <UserMain />
        <LibToast />
      </View>
      <View style={{ backgroundColor: LibStyle.colorNavigationBar || 'white', height: LibStyle.isIphoneX ? 35 : 0 }} />
    </>
  )
}

