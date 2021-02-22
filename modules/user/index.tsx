// withHooks

import React, { useEffect, useMemo } from "react";
//@ts-ignore
import Navs from "../../cache/navs";
import { View, ImageBackground } from "react-native";
import * as Font from "expo-font";
import { esp, _global, UserClass, LibWorker, LibUpdaterProperty, LibWorkloop, LibNet_status, LibTheme, LibLocale, LibDialog, LibStyle, LibImage, LibProgress, UserMain, LibToast, useSafeState, LibVersion, UserIndex_dataProperty, UseSelector, LibPictureProperty } from 'esoftplay';
import firebase from 'firebase'
import { useDispatch } from 'react-redux';

export interface UserIndexProps {

}

export interface UserIndexState {
  loading: boolean
}

const initState = {}
export function reducer(state: any, action: any): any {
  if (state == undefined) state = initState
  const actions: any = {
    "user_nav_change": {
      ...action.payload
    }
  }
  const _action = actions[action.type]
  return _action ? _action : state
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
  return (props: UserIndexProps): any => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useSafeState(true)
    const user = UseSelector((s) => s.user_class)
    //@ts-ignore
    const initialState = __DEV__ ? _global.nav__state : undefined

    function handler(currentState: any): void {
      dispatch({ type: "user_nav_change", payload: currentState })
      //@ts-ignore
      if (__DEV__) {
        _global.nav__state = currentState
      }
    }


    useMemo(() => {
      LibTheme.getTheme()
      LibLocale.getLanguage()
      LibPictureProperty.createCacheDir()

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

