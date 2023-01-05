// withHooks
// noPage
import { esp, useSafeState } from 'esoftplay';
import { LibDialog } from 'esoftplay/cache/lib/dialog/import';
import { LibImage } from 'esoftplay/cache/lib/image/import';
import { LibNet_status } from 'esoftplay/cache/lib/net_status/import';
import { LibProgress } from 'esoftplay/cache/lib/progress/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibToast } from 'esoftplay/cache/lib/toast/import';
import { LibUpdaterProperty } from 'esoftplay/cache/lib/updater/import';
import { LibVersion } from 'esoftplay/cache/lib/version/import';
import { LibWorkloop } from 'esoftplay/cache/lib/workloop/import';
import Navs from 'esoftplay/cache/navs';
import { UseDeeplink } from 'esoftplay/cache/use/deeplink/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserHook } from 'esoftplay/cache/user/hook/import';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { UserLoading } from 'esoftplay/cache/user/loading/import';
import { UserRoutes } from 'esoftplay/cache/user/routes/import';
import useGlobalState from 'esoftplay/global';
import Worker from 'esoftplay/libs/worker';
import _global from 'esoftplay/_global';
import * as Font from "expo-font";
import React, { useEffect, useLayoutEffect } from 'react';
import { Platform, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
  // @ts-ignore
  if (_global.WorkerReady < 1) {

    setTimeout(() => isWorkerReady(onReady), 10)
  } else {
    onReady()
  }
}


const route = useGlobalState<any>(undefined, { persistKey: 'user_index_routes_initial' })
export default function m(props: UserIndexProps): any {
  const [loading, setLoading] = useSafeState(true)
  const user = UserClass.state().useSelector(s => s)
  const ready = React.useRef(0)
  UseDeeplink()
  //@ts-ignore
  const initialState = __DEV__ ? route.get() : undefined

  function handler(currentState: any): void {
    //@ts-ignore
    if (__DEV__) {
      //@ts-ignore
      route.set(currentState)
    }
    UserRoutes.set(currentState)
  }

  useLayoutEffect(() => {
    let limitReady = 3

    if (esp.config("asyncWorker") == true) {
      limitReady = 2
    }

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
    //esoftplay-chatting

    LibUpdaterProperty.check()
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
        <Worker.View />
        {
          loading ?
            <UserLoading />
            :
            <>
              <LibWorkloop />
              <Navs user={user} initialState={initialState} handler={handler} />
              <LibNet_status />
              <LibDialog style={'default'} />
              <LibImage />
              <LibProgress />
              <LibToast />
              <UserHook />
              {
                __DEV__ &&
                <Pressable onPress={() => route.reset()} style={{ position: 'absolute', right: 10, top: LibStyle.height * 0.5, padding: 10, backgroundColor: 'indigo', alignItems: 'center', justifyContent: 'center', borderRadius: 50 }} >
                  <LibIcon name='delete-variant' color='white' />
                </Pressable>
              }
            </>
        }
      </View>
      <View style={{ backgroundColor: LibStyle.colorNavigationBar || 'white', height: LibStyle.isIphoneX ? 35 : 0 }} />
    </GestureHandlerRootView>
  )
}
