// withHooks
// noPage
import { esp, useSafeState } from 'esoftplay';
import { LibDialog } from 'esoftplay/cache/lib/dialog/import';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibImage } from 'esoftplay/cache/lib/image/import';
import { LibLocale } from 'esoftplay/cache/lib/locale/import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
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
import { UserLoading } from 'esoftplay/cache/user/loading/import';
import { UserRoutes } from 'esoftplay/cache/user/routes/import';
import useGlobalState from 'esoftplay/global';
import moment from 'esoftplay/moment';
import * as Font from "expo-font";
import React, { useEffect, useLayoutEffect } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

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


const route = useGlobalState<any>(undefined, { persistKey: 'user_index_routes_initial', inFile: true, loadOnInit: true })
export default function m(props: UserIndexProps): any {
  const [langId] = LibLocale.state().useState()
  moment().locale(langId)
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
    let limitReady = 2

    if (Platform.OS == 'android') {
      if (Platform.Version <= 22) {
        limitReady = 2
      }
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

    LibUpdaterProperty.check()
  }, [])
    //esoftplay-chatting

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
              {__DEV__ && <Draggable />}
            </>
        }
      </View>
      <View style={{ backgroundColor: LibStyle.colorNavigationBar || 'white', height: LibStyle.isIphoneX ? 35 : 0 }} />
    </GestureHandlerRootView>
  )
}




const Draggable = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastOffset = { x: 0, y: 0 };
  const handleGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.offsetX = translateX.value;
      ctx.offsetY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.offsetX + event.translationX;
      translateY.value = ctx.offsetY + event.translationY;
    },
    onEnd: (event) => {
      lastOffset.x += event.translationX;
      lastOffset.y += event.translationY;
    },
  });
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    };
  });
  return (
    <View style={{ position: 'absolute', right: 10 }}>
      <PanGestureHandler onGestureEvent={handleGestureEvent}>
        <Animated.View style={[animatedStyle]} >
          <Pressable onPress={() => { route.reset(); LibNavigation.backToRoot() }} style={{ right: 10, top: LibStyle.height * 0.5, padding: 10, backgroundColor: 'indigo', alignItems: 'center', justifyContent: 'center', borderRadius: 50 }} >
            <LibIcon name='delete-variant' color='white' />
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};