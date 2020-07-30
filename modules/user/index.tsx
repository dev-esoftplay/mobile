// withHooks

import React, { useEffect } from "react";
//@ts-ignore
import navs from "../../cache/navigations";
import { View, Platform } from "react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator, TransitionPresets } from 'react-navigation-stack';
import * as Font from "expo-font";
import AsyncStorage from '@react-native-community/async-storage';
import {
  esp,
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
  LibNotification,
  LibVersion,
  _global,
  UserIndex_dataProperty
} from 'esoftplay';
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

const persistenceFunctions = (() => {
  //@ts-ignore
  return __DEV__
    ? {
      async persistNavigationState(value: any) {
        UserIndex_dataProperty.userIndexData.nav__state = value
      },
      async loadNavigationState() {
        if (UserIndex_dataProperty.userIndexData.nav__state == null) {
          await Promise.reject('no data');
        }
        return UserIndex_dataProperty.userIndexData.nav__state;
      },
    }
    : {};
})();

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

  function handler(prevState: any, currentState: any): void {
    dispatch({ type: "user_nav_change", payload: currentState })
  }

  useEffect(() => {
    requestAnimationFrame(async () => {
      LibUpdaterProperty.checkAlertInstall()
      LibTheme.getTheme()
      LibLocale.getLanguage()
      await setFonts()
      try {
        if (Platform.OS == 'android')
          Notifications.removeAllNotificationListeners()
      } catch (error) {

      }
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
        let push_id = await AsyncStorage.getItem("push_id");
        if (!push_id) {
          UserClass.pushToken();
        }
      }
      if (esp.config().hasOwnProperty('firebase')) {
        try {
          firebase.initializeApp(esp.config('firebase'));
          firebase.auth().signInAnonymously();
        } catch (error) { }
      }

      let econf = esp.config()
      let navigations: any = {}
      for (let i = 0; i < navs.length; i++) {
        const nav = navs[i];
        navigations[nav] = esp.mod(nav);
      }
      UserClass.isLogin(async (user) => {
        const initRoute = (user && (user.id || user.user_id)) ? econf.home.member : econf.home.public
        let config: any = {
          headerMode: "none",
          initialRouteName: String(initRoute),
          defaultNavigationOptions: {
            animationEnabled: true,
            cardStyle: { backgroundColor: 'white' }
          },
        }
        UserIndex_dataProperty.userIndexNav.Router = createAppContainer(createStackNavigator(navigations, config))
        setLoading(false)
      })
    });
  }, [])

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        LibVersion.check()
      }, 0);
    }
  }, [loading])

  if (loading) return null
  const R = UserIndex_dataProperty.userIndexNav.Router
  return (
    <View style={{ flex: 1, paddingBottom: LibStyle.isIphoneX ? 35 : 0 }}>
      <LibWorker />
      <R {...persistenceFunctions} ref={(r: any) => LibNavigation.setRef(r)} onNavigationStateChange={handler} />
      <LibNet_status />
      <LibDialog style={'default'} />
      <LibImage />
      <LibProgress />
      <UserMain />
      <LibToast />
    </View>
  )
}