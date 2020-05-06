// withHooks

import React, { useEffect, useState, useCallback, useMemo } from "react";
import navs from "../../cache/navigations";
import { View, Platform } from "react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from 'react-navigation-stack';
import * as Font from "expo-font";
import { AsyncStorage } from 'react-native';
import {
  esp,
  _global,
  LibNotification,
  UserClass,
  LibWorker,
  LibNet_status,
  LibTheme,
  LibLocale,
  LibDialog,
  LibStyle,
  LibImage,
  LibProgress,
  UserMain,
  LibNavigation,
  LibToast,
  useSafeState,
  LibUpdaterProperty,
} from 'esoftplay';
import firebase from 'firebase'
import { Notifications } from "expo";
import { useDispatch, useSelector } from 'react-redux';

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

const persistenceFunctions = (() => {
  return __DEV__
    ? {
      async persistNavigationState(value: any) {
        _global.__nav__state = value;
      },
      async loadNavigationState() {
        if (_global.__nav__state == null) {
          await Promise.reject('no data');
        }
        return _global.__nav__state;
      },
    }
    : {};
})();

_global.Router
export default function m(props: UserIndexProps): any {
  const dispatch = useDispatch()
  const [loading, setLoading] = useSafeState(true)
  function handler(prevState: any, currentState: any): void {
    dispatch({ type: "user_nav_change", payload: currentState })
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

  useEffect(() => {
    setTimeout(async () => {
      LibUpdaterProperty.checkAlertInstall()
      LibTheme.getTheme()
      LibLocale.getLanguage()
      if (esp.config().notification == 1) {
        if (Platform.OS == 'android')
          Notifications.createChannelAndroidAsync('android', { sound: true, name: esp.appjson().expo.name, badge: true, priority: 'max', vibrate: true })
        LibNotification.listen((notifObj: any) => {
          esp.log(notifObj);
        })
      }
      if (esp.config().hasOwnProperty('firebase')) {
        try {
          firebase.initializeApp(esp.config('firebase'));
          firebase.auth().signInAnonymously();
        } catch (error) {

        }
      }
      var push_id = await AsyncStorage.getItem("push_id");
      if (!push_id) {
        UserClass.pushToken();
      }
      let econf = esp.config()
      var navigations: any = {}
      for (let i = 0; i < navs.length; i++) {
        const nav = navs[i];
        navigations[nav] = esp.mod(nav);
      }
      UserClass.isLogin(async (user) => {
        const initRoute = (user && (user.id || user.user_id)) ? econf.home.member : econf.home.public
        var config: any = {
          headerMode: "none",
          initialRouteName: String(initRoute),
          defaultNavigationOption: {
            cardStyle: {
              backgroundColor: "white"
            }
          }
        }
        _global.Router = createAppContainer(createStackNavigator(navigations, config))
        await setFonts()
        setLoading(false)
      })
    }, 0);
  }, [])

  if (loading) return null
  return (
    <View style={{ flex: 1, paddingBottom: LibStyle.isIphoneX ? 30 : 0 }}>
      <LibWorker />
      <_global.Router {...persistenceFunctions} ref={(r) => LibNavigation.setRef(r)} onNavigationStateChange={handler} />
      <LibNet_status />
      <LibDialog style={'default'} />
      <LibImage />
      <LibProgress />
      <UserMain />
      <LibToast />
    </View>
  )
}