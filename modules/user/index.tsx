// withHooks
// noPage
import { LibDialog } from 'esoftplay/cache/lib/dialog/import';
import { LibImage } from 'esoftplay/cache/lib/image/import';
import { LibLocale } from 'esoftplay/cache/lib/locale/import';
import { LibNet_status } from 'esoftplay/cache/lib/net_status/import';
import { LibProgress } from 'esoftplay/cache/lib/progress/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibToast } from 'esoftplay/cache/lib/toast/import';
import { LibUpdaterProperty } from 'esoftplay/cache/lib/updater/import';
import { LibVersion } from 'esoftplay/cache/lib/version/import';
import { LibWorker } from 'esoftplay/cache/lib/worker/import';
import { LibWorkloop } from 'esoftplay/cache/lib/workloop/import';
import Navs from 'esoftplay/cache/navs';
import { UseDeeplink } from 'esoftplay/cache/use/deeplink/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserHook } from 'esoftplay/cache/user/hook/import';
import { UserLoading } from 'esoftplay/cache/user/loading/import';
import * as ErrorReport from 'esoftplay/error';
import esp from 'esoftplay/esp';
import moment from 'esoftplay/moment';
import useSafeState from 'esoftplay/state';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useLayoutEffect } from 'react';
import { Dimensions, Platform, SafeAreaView, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";


import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: true, // Reanimated runs in strict mode by default
});

export interface UserIndexProps {

}

export interface UserIndexState {
  loading: boolean
}
function getFontConfig() {
  let fonts: any = {}
  let fontsConfig = esp.config("fonts")
  if (fontsConfig) {
    Object.keys(esp.config("fonts")).forEach((key) => {
      fonts[key] = esp.assets('fonts/' + fontsConfig[key])
    })
  }
  return fonts
}

SplashScreen.preventAutoHideAsync();

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/index.md) untuk melihat dokumentasi*/

export default function m(props: UserIndexProps): any {
  moment().locale(LibLocale.state().get())
  const [loading, setLoading] = useSafeState(true)
  const [fontLoaded] = useFonts(getFontConfig())
  //esoftplay-user-class-hook
  UseDeeplink()

  useLayoutEffect(() => {
    ErrorReport.getError()
    LibUpdaterProperty.check()
    LibVersion.check()
  }, [])


  const screenHeight = Dimensions.get('screen').height;
  const windowHeight = Dimensions.get('window').height;
  const statusBarHeight = StatusBar.currentHeight ?? 0;
  const navigationBarHeight = screenHeight - windowHeight - statusBarHeight;

  useLayoutEffect(() => {
    if (fontLoaded) {
      UserClass.isLogin(() => {
        setLoading(false)
      })
      SplashScreen.hideAsync()
    }
  }, [fontLoaded])


  //esoftplay-chatting

  const Main = Platform.OS == 'ios' ? View : SafeAreaView

  return (
    <Main style={{ flex: 1 }} >
      <KeyboardProvider >
        <GestureHandlerRootView>
          <View style={{ flex: 1 }}>
            <LibWorker />
            {
              loading ?
                <UserLoading />
                :
                <>
                  <LibWorkloop />
                  <Navs />
                  <LibNet_status />
                  <LibDialog style={'default'} />
                  <LibImage />
                  <LibProgress />
                  <LibToast />
                  <UserHook />
                </>
            }
          </View>
          <View style={{ backgroundColor: LibStyle?.colorNavigationBar || Platform.OS == 'android' ? '#ddd' : 'white', height: LibStyle.isIphoneX ? 35 : navigationBarHeight }} />
        </GestureHandlerRootView>
      </KeyboardProvider>
    </Main>
  )
}