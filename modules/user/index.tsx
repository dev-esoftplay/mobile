// withHooks

import React, { useEffect, useMemo } from "react";
//@ts-ignore
import Navs from "../../cache/navs";
import { View, ImageBackground } from "react-native";
import * as Font from "expo-font";
import { esp, _global, UserClass, LibWorker, LibUpdaterProperty, LibWorkloop, LibNet_status, LibTheme, LibLocale, LibDialog, LibStyle, LibImage, LibProgress, UserMain, LibToast, useSafeState, LibVersion, UseSelector } from 'esoftplay';
import firebase from 'firebase'

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

export default (() => {
  return function m(props: UserIndexProps): any {
    const [loading, setLoading] = useSafeState(true)
    const user = UserClass.state().useSelector(s => s)
    //@ts-ignore
    const initialState = __DEV__ ? _global.nav__state : undefined

    function handler(currentState: any): void {
      //@ts-ignore
      if (__DEV__) {
        _global.nav__state = currentState
      }
    }

    useMemo(() => {
      if (esp.config('firebase')) {
        try {
          firebase.initializeApp(esp.config('firebase'));
          firebase.auth().signInAnonymously();
        } catch (error) { }
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

    if (loading) return <ImageBackground source={esp.assets('splash.png')} style={{ flex: 1 }} />
    return (
      <>
        <View style={{ flex: 1 }}>
          <LibWorker />
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
})()

