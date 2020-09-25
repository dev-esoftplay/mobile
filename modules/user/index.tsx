// withHooks

import React, { useEffect, useRef } from "react";
//@ts-ignore
import navs from "../../cache/navigations";
import { View, Platform } from "react-native";
import * as Font from "expo-font";
import AsyncStorage from '@react-native-community/async-storage';
import { esp, UserClass, LibWorker, LibNet_status, LibTheme, LibLocale, LibDialog, LibStyle, LibImage, LibProgress, UserMain, LibNavigation, LibToast, useSafeState, LibUpdaterProperty, LibNotification, LibVersion, _global, UserIndex_dataProperty, UseSelector } from 'esoftplay';
import firebase from 'firebase'
import { useDispatch } from 'react-redux';
import * as Notifications from 'expo-notifications'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

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

const renderComponent = (s: [string, any]) => <Stack.Screen key={s[0]} name={s[0]} component={s[1]} />
export default function m(props: UserIndexProps): any {
  const dispatch = useDispatch()
  const [loading, setLoading] = useSafeState(true)
  const user = UseSelector((s) => s.user_class)
  //@ts-ignore
  const initialState = __DEV__ ? UserIndex_dataProperty.userIndexData.nav__state : undefined
  let configRouter = useRef<any>().current
  let econf = useRef(esp.config()).current
  let navigations: any = useRef({}).current

  function handler(currentState: any): void {
    dispatch({ type: "user_nav_change", payload: currentState })
    //@ts-ignore
    if (__DEV__) {
      UserIndex_dataProperty.userIndexData.nav__state = currentState
    }
  }

  useEffect(() => {
    setTimeout(async () => {
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
      for (let i = 0; i < navs.length; i++) {
        const nav = navs[i];
        navigations[nav] = esp.mod(nav);
      }
      UserClass.isLogin(async (user) => { setLoading(false) })
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
  return (
    <>
      <View style={{ flex: 1 }}>
        <LibWorker />
        <NavigationContainer
          ref={(r) => LibNavigation.setRef(r)}
          initialState={initialState}
          onStateChange={handler} >
          <Stack.Navigator
            headerMode="none"
            initialRouteName={(user?.id || user?.user_id) ? econf.home.member : econf.home.public}
            screenOptions={{ animationEnabled: true, cardStyle: { backgroundColor: 'white' } }}>
            {Object.entries(navigations).map(renderComponent)}
          </Stack.Navigator>
        </NavigationContainer>
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