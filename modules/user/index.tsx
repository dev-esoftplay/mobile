// withHooks

import React, { useEffect, useRef } from "react";
//@ts-ignore
import Navs from "../../cache/navs";
import { View, Platform } from "react-native";
import * as Font from "expo-font";
import AsyncStorage from '@react-native-community/async-storage';
import { esp, UserClass, LibWorker, LibNet_status, LibTheme, LibLocale, LibDialog, LibStyle, LibImage, LibProgress, UserMain, LibNavigation, LibToast, useSafeState, LibUpdaterProperty, LibNotification, LibVersion, _global, UserIndex_dataProperty, UseSelector, LibPictureProperty } from 'esoftplay';
import firebase from 'firebase'
import { useDispatch } from 'react-redux';
import * as Notifications from 'expo-notifications'

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

export default function m(props: UserIndexProps): any {
  const dispatch = useDispatch()
  const [loading, setLoading] = useSafeState(true)
  const user = UseSelector((s) => s.user_class)
  //@ts-ignore
  const initialState = __DEV__ ? UserIndex_dataProperty.userIndexData.nav__state : undefined

  function handler(currentState: any): void {
    dispatch({ type: "user_nav_change", payload: currentState })
    //@ts-ignore
    if (__DEV__) {
      UserIndex_dataProperty.userIndexData.nav__state = currentState
    }
  }

  useEffect(() => {
    LibTheme.getTheme()
    LibLocale.getLanguage()
    LibPictureProperty.createCacheDir()
    LibUpdaterProperty.checkAlertInstall()
    try { if (Platform.OS == 'android') Notifications.removeAllNotificationListeners() } catch (error) { }
    if (esp.config("notification") == 1) {
      LibNotification.listen()
      if (Platform.OS == 'android')
        Notifications.setNotificationChannelAsync(
          'android',
          {
            sound: 'default',
            enableLights: true,
            description: "this is description",
            name: esp.appjson().expo.name,
            importance: Notifications.AndroidImportance.MAX,
            showBadge: true,
            enableVibrate: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
          }
        )
      AsyncStorage.getItem("push_id").then((push_id) => {
        if (!push_id) {
          UserClass.pushToken();
        }
      })
    }
    if (esp.config('firebase')) {
      try {
        firebase.initializeApp(esp.config('firebase'));
        firebase.auth().signInAnonymously();
      } catch (error) { }
    }
    UserClass.isLogin(async () => {
      await setFonts()
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        LibVersion.check()
      }, 0);
    }
  }, [loading])

  if (loading) return null
  return (
    <>
      <View style={{ flex: 1 }}>
        <LibWorker />
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